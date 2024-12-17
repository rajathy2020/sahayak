from datetime import datetime, time, timedelta
from typing import List, Tuple, Optional, Dict
from shared.models import User, Booking, SubService, TimeSlot, Usertype, BookingStatus

class BookingService:
    """Service class for handling all booking-related operations including provider search and availability checks."""

    TIME_SLOT_MAPPING = {
        TimeSlot.MORNING: (time(9, 0), time(12, 0)),
        TimeSlot.MIDDAY: (time(12, 0), time(15, 0)),
        TimeSlot.AFTERNOON_EVENING: (time(15, 0), time(20, 0)),
        TimeSlot.NIGHT: (time(20, 0), time(23, 0))
    }

    @staticmethod
    async def map_service_type_with_id(filter_request: Dict, service_types: List[str]) -> List[str]:
        """
        Maps service type names to their corresponding database IDs.

        Args:
            filter_request (Dict): The filter parameters containing service types
            service_types (List[str]): List of valid service type names

        Returns:
            List[str]: List of service IDs corresponding to the requested service types

        Example:
            filter_request = {"service": "kitchen"}
            service_types = ["kitchen", "bathroom"]
            returns -> ["12345"] # ID of kitchen service
        """
        services_ids = []
        for key, value in filter_request.items():
            if value in service_types:
                query = {"name": value}
                services = await SubService.search_document(query)
                if services:
                    services_ids.append(str(services[0].id))
        return services_ids

    async def build_provider_query(
        self,
        filter_request: Dict,
        service_types: List[str]
    ) -> Tuple[Dict, datetime]:
        """Build MongoDB query for provider search"""
        subservices = await self.map_service_type_with_id(filter_request, service_types)
        requested_date = datetime.strptime(
            filter_request.get("requested_date", datetime.now().strftime("%Y-%m-%d")),
            "%Y-%m-%d"
        ).date()
        
        date_str = requested_date.strftime("%Y-%m-%d")
        query = {
            "services_offered": {"$all": subservices},
            "city": filter_request["city"],
            "user_type": Usertype.SERVICE_PROVIDER,
            "blocked_dates": {
                "$not": {
                    "$elemMatch": {
                        "$gte": datetime.combine(requested_date, datetime.min.time()),
                        "$lt": datetime.combine(requested_date + timedelta(days=1), datetime.min.time())
                    }
                }
            }
        }
        
        if filter_request.get("available_time_slots"):
            time_slot = filter_request["available_time_slots"]

            query[f"available_dates.{date_str}"] = time_slot
        
        print("Final query:", query)  # Debug print
        return query, requested_date

    @staticmethod
    async def get_provider_bookings(provider_id: str, date: datetime) -> List[Booking]:
        """
       Retrieves all active bookings (CONFIRMED or RESERVED) for a specific provider on a given date.
        """
        return await Booking.search_document({
            "provider_id": str(provider_id),
            "booked_date": {
                "$gte": datetime.combine(date, datetime.min.time()),
                "$lt": datetime.combine(date + timedelta(days=1), datetime.min.time())
            },
            "deleted_at": None,
            "status": {
                "$in": [BookingStatus.CONFIRMED, BookingStatus.RESERVED]
            }
        })

    @staticmethod
    async def calculate_services_duration(service_ids: List[str]) -> timedelta:
        """
        Calculates the total duration needed for a set of services.

        Args:
            service_ids (List[str]): List of service IDs

        Returns:
            timedelta: Total duration needed for all services combined

        Example:
            calculate_services_duration(["service1", "service2"])
            returns -> timedelta(hours=3)
        """
        total_duration = timedelta(hours=0)
        for service_id in service_ids:
            service = await SubService.get_document(doc_id=service_id)
            if service:
                total_duration += timedelta(hours=service.duration)
        return total_duration

    @staticmethod
    def get_available_time_ranges(
        slot_start_dt: datetime,
        slot_end_dt: datetime,
        booked_ranges: List[Tuple[datetime, datetime]]
    ) -> List[Tuple[datetime, datetime]]:
        """
        Calculates available time ranges within a slot, considering existing bookings.

        Args:
            slot_start_dt (datetime): Start time of the slot
            slot_end_dt (datetime): End time of the slot
            booked_ranges (List[Tuple[datetime, datetime]]): List of booked time ranges

        Returns:
            List[Tuple[datetime, datetime]]: List of available time ranges

        Example:
            slot_start = datetime(2024,3,20,9,0)
            slot_end = datetime(2024,3,20,12,0)
            booked = [(datetime(2024,3,20,10,0), datetime(2024,3,20,11,0))]
            returns -> [(datetime(2024,3,20,9,0), datetime(2024,3,20,10,0)),
                       (datetime(2024,3,20,11,0), datetime(2024,3,20,12,0))]
        """
        available_ranges = [(slot_start_dt, slot_end_dt)]
        booked_ranges.sort(key=lambda x: x[0])

        for start, end in booked_ranges:
            new_ranges = []
            for avail_start, avail_end in available_ranges:
                if start >= avail_end or end <= avail_start:
                    new_ranges.append((avail_start, avail_end))
                else:
                    if avail_start < start:
                        new_ranges.append((avail_start, start))
                    if end < avail_end:
                        new_ranges.append((end, avail_end))
            available_ranges = new_ranges
        
        return available_ranges

    @staticmethod
    async def get_provider_services_details(provider: User) -> List[SubService]:
        """Get detailed information about provider's services."""
        services_offered_details = []
        for service_offered in provider.services_offered:
            sub_service = await SubService.get_document(doc_id=service_offered)
            if sub_service:
                services_offered_details.append(sub_service)
        return services_offered_details

    async def check_provider_availability(
        self,
        provider: User,
        requested_date: datetime,
        requested_time_slot: Optional[str],
        required_services: List[str]
    ) -> bool:
        """
        Checks if a provider is available for the requested services at the specified time.
        Considers both time slot availability and existing bookings (CONFIRMED or RESERVED).

        Args:
            provider (User): The service provider to check
            requested_date (datetime): The date for the service
            requested_time_slot (Optional[str]): The time slot requested
            required_services (List[str]): List of service IDs to be performed

        Returns:
            bool: True if provider is available, False otherwise
        """
        if not requested_time_slot:
            return True

        # Check for existing bookings
       

        # Check time slot availability
        provider_bookings = await self.get_provider_bookings(str(provider.id), requested_date)
        slot_start, slot_end = self.TIME_SLOT_MAPPING[requested_time_slot]
        slot_start_dt = datetime.combine(requested_date, slot_start)
        slot_end_dt = datetime.combine(requested_date, slot_end)
        total_duration = await self.calculate_services_duration(required_services)
        
        booked_ranges = [
            (booking.start_time, booking.end_time)
            for booking in provider_bookings
            if booking.time_slot == requested_time_slot
        ]
        
        available_ranges = self.get_available_time_ranges(
            slot_start_dt, 
            slot_end_dt, 
            booked_ranges
        )
        
        return any(avail_end - avail_start >= total_duration 
                  for avail_start, avail_end in available_ranges)

    async def get_available_providers(
        self,
        filter_request: Dict,
        service_types: List[str]
    ) -> List[User]:
        """
        Retrieves all available providers matching the search criteria and availability requirements.
        Only returns providers who don't have CONFIRMED or RESERVED bookings for the requested time.

        Args:
            filter_request (Dict): Search criteria including city, services, date, time slot
            service_types (List[str]): List of valid service type names

        Returns:
            List[User]: List of available providers matching all criteria and having no booking conflicts
        """
        # Build basic query and get requested date
        query, requested_date = await self.build_provider_query(filter_request, service_types)
        requested_time_slot = filter_request.get("available_time_slots")

        # Get all providers matching basic criteria
        service_providers = await User.search_document(query)
        if not service_providers:
            return []
        

        # Filter providers based on availability
        available_providers = []
        for provider in service_providers:
            if await self.check_provider_availability(
                provider=provider,
                requested_date=requested_date,
                requested_time_slot=requested_time_slot,
                required_services=await self.map_service_type_with_id(filter_request, service_types)
            ):
                provider.services_offered_details = await self.get_provider_services_details(provider)
                available_providers.append(provider)

        return available_providers
