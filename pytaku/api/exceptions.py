# Request to external site faild
class FailedRequestError(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)
