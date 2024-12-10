from typing import Dict

class DocumentSchemas:
    SALARY = {
        "type": "json_schema",
        "json_schema": {
            "name": "salary_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "gross_salary": {
                        "type": "number",
                        "description": "The gross salary amount before deductions"
                    },
                    "net_salary": {
                        "type": "number",
                        "description": "The net salary amount after all deductions"
                    },
                    "tax_deductions": {
                        "type": "number",
                        "description": "Total tax deductions from salary"
                    },
                    "social_security_contributions": {
                        "type": "number",
                        "description": "Social security contributions amount"
                    },
                    "pay_period": {
                        "type": "string",
                        "enum": ["monthly", "yearly"],
                        "description": "The period for which the salary is paid"
                    },
                    "currency": {
                        "type": "string",
                        "description": "Currency of the salary amounts"
                    },
                    "payment_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Date when the salary is paid"
                    },
                    "special_clauses": {
                        "type": "string",
                        "description": "Special clauses mentioned in the document"
                    }
                },
                "required": ["gross_salary", "net_salary", "currency"],
                "additionalProperties": False
            }
        }
    }

    HOUSE_CONTRACT = {
        "type": "json_schema",
        "json_schema": {
            "name": "house_contract_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "monthly_rent": {
                        "type": "number",
                        "description": "Monthly rent amount"
                    },
                    "security_deposit": {
                        "type": "number",
                        "description": "Security deposit amount"
                    },
                    "contract_start_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Start date of the rental contract"
                    },
                    "contract_end_date": {
                        "type": "string",
                        "format": "date",
                        "description": "End date of the rental contract"
                    },
                    "address": {
                        "type": "object",
                        "properties": {
                            "street": {
                                "type": "string",
                                "description": "Street name and number"
                            },
                            "city": {
                                "type": "string",
                                "description": "City name"
                            },
                            "postal_code": {
                                "type": "string",
                                "description": "Postal code"
                            },
                            "country": {
                                "type": "string",
                                "description": "Country name"
                            }
                        },
                        "required": ["street", "city"],
                        "additionalProperties": False
                    },
                    "landlord": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Full name of the landlord"
                            },
                            "contact": {
                                "type": "string",
                                "description": "Contact information of the landlord"
                            }
                        },
                        "required": ["name"],
                        "additionalProperties": False
                    }
                },
                "required": ["monthly_rent", "contract_start_date", "address"],
                "additionalProperties": False
            }
        }
    }

    OTHER_DOC = {
        "type": "json_schema",
        "json_schema": {
            "name": "other_doc_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "document_type": {
                        "type": "string",
                        "description": "Type or category of the document"
                    },
                    "dates": {
                        "type": "object",
                        "properties": {
                            "issue_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Date when document was issued"
                            },
                            "effective_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Date when document becomes effective"
                            },
                            "expiry_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Date when document expires"
                            }
                        },
                        "additionalProperties": False
                    },
                    "amounts": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "description": {
                                    "type": "string",
                                    "description": "Description of the amount"
                                },
                                "value": {
                                    "type": "number",
                                    "description": "Numerical value"
                                },
                                "currency": {
                                    "type": "string",
                                    "description": "Currency of the amount"
                                }
                            },
                            "required": ["value"],
                            "additionalProperties": False
                        }
                    }
                },
                "additionalProperties": False
            }
        }
    }

    JOB_CONTRACT = {
        "type": "json_schema",
        "json_schema": {
            "name": "job_contract_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "job_title": {
                        "type": "string",
                        "description": "Title of the job position"
                    },
                    "employer": {
                        "type": "string",
                        "description": "Name of the employer"
                    },
                    "employee": {
                        "type": "string",
                        "description": "Name of the employee"
                    },
                    "start_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Start date of the employment"
                    },
                    "end_date": {
                        "type": "string",
                        "format": "date",
                        "description": "End date of the employment"
                    },
                    "salary": {
                        "type": "number",
                        "description": "Salary amount"
                    },
                    "currency": {
                        "type": "string",
                        "description": "Currency of the salary"
                    },
                    "working_hours": {
                        "type": "string",
                        "description": "Working hours per week"
                    },
                    "benefits": {
                        "type": "string",
                        "description": "Benefits provided by the employer"
                    }
                },
                "required": ["job_title", "employer", "employee", "start_date", "salary", "currency"],
                "additionalProperties": False
            }
        }
    }

    UTILITY_BILL = {
        "type": "json_schema",
        "json_schema": {
            "name": "utility_bill_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "billing_period": {
                        "type": "object",
                        "properties": {
                            "start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Start date of the billing period"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "End date of the billing period"
                            }
                        },
                        "required": ["start_date", "end_date"]
                    },
                    "costs": {
                        "type": "object",
                        "properties": {
                            "heating": {
                                "type": "number",
                                "description": "Heating costs for the period"
                            },
                            "water": {
                                "type": "number",
                                "description": "Water costs for the period"
                            },
                            "electricity": {
                                "type": "number",
                                "description": "Electricity costs if included"
                            },
                            "garbage": {
                                "type": "number",
                                "description": "Garbage collection costs"
                            },
                            "cleaning": {
                                "type": "number",
                                "description": "Building cleaning costs"
                            },
                            "other": {
                                "type": "number",
                                "description": "Other additional costs"
                            }
                        }
                    },
                    "consumption": {
                        "type": "object",
                        "properties": {
                            "heating_kwh": {
                                "type": "number",
                                "description": "Heating consumption in kWh"
                            },
                            "water_cubic_meters": {
                                "type": "number",
                                "description": "Water consumption in cubic meters"
                            }
                        }
                    },
                    "total_amount": {
                        "type": "number",
                        "description": "Total amount of all utilities"
                    },
                    "already_paid": {
                        "type": "number",
                        "description": "Amount already paid through monthly advances"
                    },
                    "balance_due": {
                        "type": "number",
                        "description": "Remaining balance to pay or receive"
                    },
                    "currency": {
                        "type": "string",
                        "description": "Currency of all amounts"
                    },
                    "property_address": {
                        "type": "object",
                        "properties": {
                            "street": {"type": "string"},
                            "city": {"type": "string"},
                            "postal_code": {"type": "string"}
                        }
                    }
                },
                "required": ["billing_period", "total_amount", "currency"],
                "additionalProperties": False
            }
        }
    }

    SOCIAL_SECURITY = {
        "type": "json_schema",
        "json_schema": {
            "name": "social_security_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "insurance_number": {
                        "type": "string",
                        "description": "Social security insurance number (Versicherungsnummer)"
                    },
                    "personal_info": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "date_of_birth": {
                                "type": "string",
                                "format": "date"
                            },
                            "nationality": {"type": "string"}
                        },
                        "required": ["name"]
                    },
                    "contributions": {
                        "type": "object",
                        "properties": {
                            "pension": {
                                "type": "number",
                                "description": "Pension insurance contributions"
                            },
                            "health": {
                                "type": "number",
                                "description": "Health insurance contributions"
                            },
                            "unemployment": {
                                "type": "number",
                                "description": "Unemployment insurance contributions"
                            },
                            "nursing_care": {
                                "type": "number",
                                "description": "Nursing care insurance contributions"
                            }
                        }
                    },
                    "employer_contributions": {
                        "type": "object",
                        "properties": {
                            "pension": {"type": "number"},
                            "health": {"type": "number"},
                            "unemployment": {"type": "number"},
                            "nursing_care": {"type": "number"}
                        }
                    },
                    "coverage_period": {
                        "type": "object",
                        "properties": {
                            "start_date": {
                                "type": "string",
                                "format": "date"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date"
                            }
                        }
                    },
                    "total_contributions": {
                        "type": "number",
                        "description": "Total of all contributions"
                    },
                    "insurance_provider": {
                        "type": "string",
                        "description": "Name of the insurance provider"
                    },
                    "insurance_type": {
                        "type": "string",
                        "enum": ["public", "private"],
                        "description": "Type of insurance (public or private)"
                    },
                    "currency": {
                        "type": "string",
                        "description": "Currency of all monetary values"
                    }
                },
                "required": ["insurance_number", "personal_info", "currency"],
                "additionalProperties": False
            }
        }
    }

class DocumentPrompts:
    SALARY = """
    Extract the following salary information from the document:
    - Gross salary amount
    - Net salary amount
    - Tax deductions
    - Social security contributions
    - Pay period (monthly/yearly)
    - Currency
    - Payment date
    - Special clauses mentioned in the document
    Only if available , else keep it empty
    """

    HOUSE_CONTRACT = """
    Extract the following rental contract information:
    - Monthly rent amount
    - Security deposit amount
    - Contract start date
    - Contract end date
    - Complete address (street, city, postal code, country)
    - Landlord's name and contact information
    """

    OTHER_DOC = """
    Extract key information including:
    - Document type/category
    - Important dates (issue, effective, expiry)
    - Any monetary amounts with descriptions
    - Key parties involved
    """

    JOB_CONTRACT = """
    Extract the following job contract information:
    - Job title
    - Employer's name
    - Employee's name
    - Start date of employment
    - End date of employment (if applicable)
    - Salary amount and currency
    - Working hours per week
    - Benefits provided by the employer
    """

    UTILITY_BILL = """
    Extrahiere die folgenden Informationen aus der Nebenkostenabrechnung:
    - Abrechnungszeitraum (Start- und Enddatum)
    - Einzelne Kosten für:
      * Heizung
      * Wasser
      * Strom (falls enthalten)
      * Müllabfuhr
      * Hausreinigung
      * Sonstige Kosten
    - Verbrauchsdaten:
      * Heizung in kWh
      * Wasser in Kubikmetern
    - Gesamtbetrag
    - Bereits gezahlte Vorauszahlungen
    - Nachzahlung oder Guthaben
    - Währung
    - Immobilienadresse

    Gebe NUR das JSON-Objekt zurück. Keine zusätzlichen Erklärungen.
    Verwende null für fehlende Werte.
    """

    SOCIAL_SECURITY = """
    Extrahiere die folgenden Informationen aus dem Sozialversicherungsdokument:
    - Versicherungsnummer
    - Persönliche Informationen:
      * Name
      * Geburtsdatum
      * Nationalität
    - Beiträge:
      * Rentenversicherung
      * Krankenversicherung
      * Arbeitslosenversicherung
      * Pflegeversicherung
    - Arbeitgeberbeiträge (falls angegeben)
    - Versicherungszeitraum
    - Gesamtbeiträge
    - Versicherungsanbieter
    - Versicherungsart (gesetzlich/privat)
    - Währung

    Gebe NUR das JSON-Objekt zurück. Keine zusätzlichen Erklärungen.
    Verwende null für fehlende Werte.
    """

def get_document_config(doc_type: str) -> Dict:
    """Get the schema and prompt for a specific document type."""
    schemas = {
        "SALARY": DocumentSchemas.SALARY,
        "HOUSE_CONTRACT": DocumentSchemas.HOUSE_CONTRACT,
        "OTHER_DOC": DocumentSchemas.OTHER_DOC,
        "JOB_CONTRACT": DocumentSchemas.JOB_CONTRACT,
        "UTILITY_BILL": DocumentSchemas.UTILITY_BILL,
        "SOCIAL_SECURITY": DocumentSchemas.SOCIAL_SECURITY
    }
    
    prompts = {
        "SALARY": DocumentPrompts.SALARY,
        "HOUSE_CONTRACT": DocumentPrompts.HOUSE_CONTRACT,
        "OTHER_DOC": DocumentPrompts.OTHER_DOC,
        "JOB_CONTRACT": DocumentPrompts.JOB_CONTRACT,
        "UTILITY_BILL": DocumentPrompts.UTILITY_BILL,
        "SOCIAL_SECURITY": DocumentPrompts.SOCIAL_SECURITY
    }
    
    return {
        "schema": schemas.get(doc_type, DocumentSchemas.OTHER_DOC),
        "prompt": prompts.get(doc_type, DocumentPrompts.OTHER_DOC)
    } 