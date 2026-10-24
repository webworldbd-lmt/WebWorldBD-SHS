import os
from playwright.sync_api import sync_playwright

def run_verification(page):
    # Navigate to admin.html via local HTTP server
    page.goto("http://localhost:8000/admin.html")
    page.wait_for_timeout(1000)

    # 1. Check title & Language Toggle
    lang_btn = page.locator("#lang-switch-btn")
    if lang_btn.is_visible():
        lang_btn.click()
        page.wait_for_timeout(500)

    # 2. Click through tabs
    # Messenger
    messenger_link = page.locator('a[data-admin-tab="messenger"]')
    if messenger_link.is_visible():
        messenger_link.click()
        page.wait_for_timeout(500)

    # Users
    users_link = page.locator('a[data-admin-tab="users"]')
    if users_link.is_visible():
        users_link.click()
        page.wait_for_timeout(500)

    # Switch language back to test dynamic translation re-render
    if lang_btn.is_visible():
        lang_btn.click()
        page.wait_for_timeout(500)

    # Back to messenger
    if messenger_link.is_visible():
        messenger_link.click()
        page.wait_for_timeout(500)

    # Screenshot final state
    page.screenshot(path="/home/jules/verification/screenshots/admin_panel_verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
