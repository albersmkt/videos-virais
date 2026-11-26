from pathlib import Path
import sys
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import Handler

class handler(Handler):
    def normalize_route(self):
        url = urlsplit(self.path)
        action = parse_qs(url.query).get("action", [url.path.rsplit("/", 1)[-1]])[0]
        self.path = "/api/" + action

    def do_GET(self):
        self.normalize_route()
        super().do_GET()

    def do_POST(self):
        self.normalize_route()
        super().do_POST()
