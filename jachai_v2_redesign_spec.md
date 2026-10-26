# Project Overview: Jachai (V2 Redesign)

**App Name:** Jachai (meaning: Verification)
**Core Purpose:** An AI detection application that verifies news, information, text, photos, and media to protect users from AI-generated fakes and scams.
**Target Audience:** Primarily elders, grown-ups, and users who may have lower digital literacy or visual/motor impairments.
**Design Philosophy:** Extreme simplicity, large touch targets, high contrast, clear language (no jargon), and accessible feedback mechanisms (haptics).

## 1. Global Styling & Color Palette

The app supports both Light and Dark modes. The primary accent color is a lighter version of Cornflower Blue to ensure high visibility and a calming, trustworthy feel.

### Dark Mode Theme

- **Background:** Charcoal Black (`#1A1B22` or `bg-slate-900`)
- **Surface/Cards:** Dark Grey (`#2D333B` or `bg-slate-800`)
- **Text/Icons:** White (`#FFFFFF`) for high contrast readability.
- **Accent/Primary Buttons:** Lighter Cornflower Blue (`#8CA8F9` or `bg-blue-400`).

### Light Mode Theme

- **Background:** Pure White (`#FFFFFF`) or very light grey (`#F8F9FA`).
- **Surface/Cards:** White with a subtle shadow (`#FFFFFF`).
- **Text/Icons:** Charcoal Black (`#1A1B22`) for maximum contrast.
- **Accent/Primary Buttons:** Lighter Cornflower Blue (`#8CA8F9` or `bg-blue-400`).

### Global Typography & Accessibility

- **Font:** A clean, highly legible sans-serif (e.g., Inter, Roboto, or system-default).
- **Sizing:** Must support dynamic scaling. The app has built-in text size overrides (Small, Med, Large) in the settings. Default to large, readable font sizes (minimum 16px for body text).

## 2. Global Components

- **Header:** Most screens have a top header with the text "Jachai" aligned to the left, and a **Gear Icon** (Settings) aligned to the right.
- **Bottom Navigation Bar:** Persistent across main app views. Contains 3 to 4 prominent icons with text labels:
  1.  `Text` (Main text checker)
  2.  `Media` (Photo/Video checker)
  3.  `Bubble` (Floating widget toggle)
  4.  `Account` (Profile)
- **"Share!" Section:** Found at the bottom of the content area on main screens. Contains promotional links or buttons to share the app on FB, IG, WA (WhatsApp), etc.

---

## 3. Screen-by-Screen Breakdown

### Screen 1: Main Page (Default - Text Check)

_Reference: main_page.jpg_

- **Header:** "Jachai" title + Gear Icon.
- **Greeting/Context:** Displays user's name and an "Explain + Filter words" section (briefly explaining how to use the app).
- **Screen Title:** "Check a Text".
- **Core Interaction:** A very large, prominent Text Box where users can paste or type text to be verified for AI generation.
- **Footer:** "Share!" section with social links.

### Screen 2: Photo/Video Page

_Reference: photo_video_page.jpg_

- **Header:** "Jachai" title + Gear Icon.
- **Screen Title:** "Upload".
- **Core Interaction:** A massive, highly visible "Upload a pic/video" drag-and-drop or tap zone (Media Picker). This should be the focal point of the screen.
- **Footer:** "Share!" section with social links.

### Screen 3: Floating Bubble Page

_Reference: floating_bubble_page.jpg_

- **Header:** "Jachai" title + Gear Icon.
- **Screen Title:** "Floating Bubble".
- **Explanation:** Text explaining what the bubble does (e.g., "Keep Jachai on your screen to quickly check messages").
- **Core Interaction:** A **MASSIVE** On/Off toggle switch for the floating bubble. Because of the elder target audience, this switch should be heavily stylized, very large, and clearly indicate its state (color-filled when ON).

### Screen 4: Account / Profile Page

_Reference: Profile_page.jpg_

- **Header:** Large circular Avatar/Profile Picture placeholder with a '+' icon to add/change the photo.
- **User Info Form:** Three large input fields/display boxes stacked vertically:
  All kind of static user details that needs to be shown here, we don't have accounts feature yet. So, just to give an idea when we have user accounts, how it will look
- **Stats Section:** A grid or row showing usage statistics:
  - "AI Detected" (count of fakes caught)
  - "Time" (time saved or time used)
  - "History" (button to view past scans)
  - Or, any other info that you think will be helpful in here, all static just to show how it will be, not connected to any database or api. AI detected, time, history aren't fixed, think what will be good here.
- **Footer:** "Share!" section.

### Screen 5: Settings Page (fill it up with other things which might be needed in settings, for now all static, expect for the ones that actually work like zoom, language, mode toggles)

_Reference: settings_page.jpg_

- **Header:** A prominent "<- Back" button (crucial for navigation) and "Settings" title.
- **Mode Toggle:** A clear switch or segmented control between "White" (Light Mode) and "Dark" (Dark Mode).
- **Language / Size Selector:**
  - Section titled "User Info / Language Size".
  - Three visually distinct buttons or a segmented control: `Small`, `Med`, `Large`.
- **Haptics & Vibration:** A checkbox or toggle labeled "Vibrate when AI is detect". _(Crucial accessibility feature for elders to get physical feedback when a scam/fake is found)._
- **Support/Dev Info:**
  - "Contact us" button/link.
  - Server URL input or display (e.g., `12.0.0.1`). (that we can change)

## 4. Implementation Notes for Claude

- Please only change the frontend of this existing project, donot mess with the backend now.
