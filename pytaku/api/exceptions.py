class PyError(Exception):
    def __init__(self, value, status_code=400):
        self.value = value
        self.status_code = status_code
