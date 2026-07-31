import html
import re

def sanitize_text(text: str) -> str:
    if not text:
        return ""
    # HTML escape
    clean = html.escape(text)
    # Remove dangerous script tags or inline events
    clean = re.sub(r'<script.*?>.*?</script>', '', clean, flags=re.DOTALL | re.IGNORECASE)
    return clean.strip()
