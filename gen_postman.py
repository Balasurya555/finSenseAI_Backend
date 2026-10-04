import json

collection = {
    "info": {
        "name": "FitSense AI E2E",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:5000/api", "type": "string"},
        {"key": "token", "value": "", "type": "string"}
    ],
    "item": [
        {
            "name": "System",
            "item": [
                {
                    "name": "Health Check",
                    "request": {
                        "method": "GET",
                        "url": "{{baseUrl}}/health"
                    }
                }
            ]
        },
        {
            "name": "Auth",
            "item": [
                {
                    "name": "Register",
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "var jsonData = pm.response.json();",
                                    "pm.collectionVariables.set('token', jsonData.data.token);"
                                ],
                                "type": "text/javascript"
                            }
                        }
                    ],
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": '{\n  "name": "Postman User",\n  "email": "postman@example.com",\n  "password": "Password123"\n}'
                        },
                        "url": "{{baseUrl}}/auth/register"
                    }
                },
                {
                    "name": "Login",
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "var jsonData = pm.response.json();",
                                    "pm.collectionVariables.set('token', jsonData.data.token);"
                                ],
                                "type": "text/javascript"
                            }
                        }
                    ],
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": '{\n  "email": "postman@example.com",\n  "password": "Password123"\n}'
                        },
                        "url": "{{baseUrl}}/auth/login"
                    }
                },
                {
                    "name": "Profile",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": "{{baseUrl}}/auth/profile"
                    }
                }
            ]
        }
    ]
}

with open("FitSense.postman_collection.json", "w") as f:
    json.dump(collection, f, indent=2)
