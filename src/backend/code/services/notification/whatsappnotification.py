from twilio.rest import Client
import json
account_sid = ""
auth_token = ""
sent_from = "whatsapp:+4915904898034"
CLIENT_CONTENT_SID = ""

class WhatsappNotification:
    
    @classmethod
    def charge_client(cls, provider, client):
        account_sid = account_sid
        auth_token = auth_token
        client = Client(account_sid, auth_token)
        try:
            client_message = client.messages.create(
                content_sid=CLIENT_CONTENT_SID,
                to=f"whatsapp:{client.whatsapp_number}",
                from_=sent_from  ,
                content_variables=json.dumps({"1": provider.name, "2": "14 Nov", "3": "14:46"}),
)           
        except:
            print( f"Error occurred in sending the whatass message to client {client.name}" )



