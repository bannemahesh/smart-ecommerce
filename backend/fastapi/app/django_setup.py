import os
import sys
import django


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DJANGO_DIR = os.path.join(BASE_DIR, "django")

sys.path.insert(0, DJANGO_DIR)

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "admin_panel.settings"
)

django.setup()