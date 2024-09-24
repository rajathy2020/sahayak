from abc import ABC, abstractmethod

class AbstractUserManagement():
    @abstractmethod
    def get_login_url(self) -> str:
        """Entry point for the document processing for indiviual checks"""
        pass

    @abstractmethod
    def run_callback(self) -> str:
        """Entry point for the document processing for indiviual checks"""
        pass


    @abstractmethod
    def logout(self) -> str:
        """Entry point for the document processing for indiviual checks"""
        pass
    







