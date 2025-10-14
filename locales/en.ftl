## Commands

start =
    .description = Start the bot
language =
    .description = Change language
setcommands =
    .description = Set bot commands
natal =
    .description = Natal chart

## Language Feature

language-select = Please, select your language
language-changed = Language successfully changed!

## Admin Feature

admin-commands-updated = Commands updated.

## Unhandled Feature

unhandled = Unrecognized command. Try /start

## Astro Data Collection (Shared)

astro-data-birth-date = 📅 Please enter the birth date in DD.MM.YYYY or DD-MM-YYYY format (e.g. 15.06.1990).
astro-data-birth-date-invalid = ⚠️ That date looks off. Try DD.MM.YYYY or DD-MM-YYYY (e.g. 15.06.1990).
astro-data-birth-time = ⏰ Now enter the birth time in HH:MM or HH-MM (e.g. 14:30).
astro-data-birth-time-invalid = ⚠️ I couldn't read the time. Use HH:MM or HH-MM (e.g. 14:30).
astro-data-location = 🗺️ Where was the person born? Choose a city below, share location, or type the name manually.
astro-data-location-invalid = ⚠️ Please share location or enter a city name.
astro-data-location-not-found = 🤔 I couldn't find that city. Try again or pick from the list.
astro-data-location-not-found-final = 😔 City not found. Let's try using coordinates instead.
astro-data-location-not-found-try-coordinates = 🤔 City not found. Please enter coordinates in format: latitude, longitude (e.g. 55.7558, 37.6173)
astro-data-coordinates-invalid = ⚠️ Invalid coordinate format. Use format: latitude, longitude (e.g. 55.7558, 37.6173)
astro-data-location-share = 📡 You can also share location — I'll detect the timezone automatically.
astro-data-skip = Skip
astro-data-location-request = 📡 Share location

## Onboarding Feature

onboarding-start = 🌟 Welcome! Let's set up your astro profile so I can craft personalized insights.
onboarding-birth-date = 📅 Please enter your birth date in DD.MM.YYYY or DD-MM-YYYY format (e.g. 15.06.1990).
onboarding-birth-date-invalid = ⚠️ That date looks off. Try DD.MM.YYYY or DD-MM-YYYY (e.g. 15.06.1990).
onboarding-birth-time = ⏰ Great! Now enter the birth time in HH:MM or HH-MM (e.g. 14:30). You can skip if you're unsure.
onboarding-birth-time-invalid = ⚠️ I couldn't read the time. Use HH:MM or HH-MM (e.g. 14:30).
onboarding-location = 🗺️ Where were you born? Choose a city below, share your location, or type the name manually.
onboarding-location-invalid = ⚠️ Please share your location or enter a city name.
onboarding-location-not-found = 🤔 I couldn't find that city. Try again or pick from the list.
onboarding-location-not-found-final = 😔 City not found. Let's try using coordinates instead.
onboarding-location-not-found-try-coordinates = 🤔 City not found. Please enter coordinates in format: latitude, longitude (e.g. 55.7558, 37.6173)
onboarding-coordinates-invalid = ⚠️ Invalid coordinate format. Use format: latitude, longitude (e.g. 55.7558, 37.6173)
onboarding-location-share = 📡 You can also share your location — I'll detect the timezone automatically.
onboarding-validation-error = ⚠️ I couldn't process that. Let's try again.
onboarding-complete = ✅ Great! Your profile is set up.
onboarding-skip = Skip
onboarding-location-request = 📡 Share location

## Zodiac Signs

zodiac-aries = Aries
zodiac-taurus = Taurus
zodiac-gemini = Gemini
zodiac-cancer = Cancer
zodiac-leo = Leo
zodiac-virgo = Virgo
zodiac-libra = Libra
zodiac-scorpio = Scorpio
zodiac-sagittarius = Sagittarius
zodiac-capricorn = Capricorn
zodiac-aquarius = Aquarius
zodiac-pisces = Pisces

## Profile Feature

profile-info =
  👤 Name: { $name }
  📅 Birth date: { $birthDate }
  ⏰ Birth time: { $birthTime }
  🌍 Timezone: { $timezone }
  📍 City: { $city }
  ♈ Zodiac sign: { $zodiac }

profile-menu-title = 📋 Main Menu

profile-menu-ascendant = 🌅 Ascendant
profile-menu-natal-chart = 🔮 Natal Chart
profile-menu-compatibility = 💕 Check Compatibility
profile-menu-tarot = 🃏 Tarot Spreads
profile-menu-settings = ⚙️ Settings
profile-menu-restart-onboarding = 🔄 Restart Registration

profile-ascendant-message = 🌅 Ascendant information coming soon!
profile-natal-chart-message = 🔮 Your natal chart is being prepared!
profile-compatibility-message = 💕 Compatibility check feature is under development!
profile-tarot-message = 🃏 Tarot spreads will be available soon!
profile-settings-message = ⚙️ Profile settings
profile-restart-onboarding-message = 🔄 Restarting registration...

profile-field-missing = —

## Error Messages

errors-something-went-wrong = ⚠️ Something went wrong. Please try again or return to /start

## Natal Charts Feature

natal-charts-menu-title = 🔮 Choose natal chart type:
natal-charts-menu-my-chart = 🌟 My natal chart
natal-charts-menu-get-my-chart = ✨ Get my natal chart
natal-charts-menu-guest-chart = 👤 Guest natal chart
natal-charts-menu-back = ◀️ Back
natal-charts-guest-generating = 🔮 Generating guest natal chart...
natal-charts-user-generating = 🌟 Generating your natal chart...
natal-charts-user-fetching = 🔮 Fetching your natal chart...
natal-charts-error = ⚠️ Failed to get natal chart. Please try later.
natal-charts-guest-success = ✅ Guest natal chart created!

ascendants-menu-title = 🌅 Choose ascendant type:
ascendants-menu-my-ascendant = 🌟 My ascendant
ascendants-menu-get-my-ascendant = ✨ Get my ascendant
ascendants-menu-guest-ascendant = 👤 Guest ascendant
ascendants-menu-back = ◀️ Back
ascendants-interpretation-text = { $interpretation }
ascendants-guest-generating = 🌌 The universe is discovering the ascendant...
ascendants-user-generating = ✨ The universe is discovering your ascendant...
ascendants-user-fetching = 🌅 The universe is revealing your ascendant...
ascendants-error = ⚠️ Failed to get ascendant. Please try later.
ascendants-guest-success = ✅ Guest ascendant created!
ascendants-user-success = ✅ Your ascendant is ready!
ascendants-user-missing-data = ⚠️ Please complete birth date, time, and location in your profile to get an ascendant.
ascendants-guest-missing-data = ⚠️ Provide birth data in your profile to request a guest ascendant.
natal-charts-user-success = ✅ Your natal chart is ready!
natal-charts-user-missing-data = ⚠️ Please complete birth date, time, and location in your profile to get a natal chart.
natal-charts-guest-missing-data = ⚠️ Provide birth data in your profile to request a guest natal chart.

## Compatibilities Feature

compatibilities-menu-title = 💞 Choose compatibility type:
compatibilities-menu-user-guest = 👥 Compatibility with guest
compatibilities-menu-my-compatibilities = 📋 My Compatibilities
compatibilities-menu-back = ◀️ Back
compatibilities-guest-generating = 🌌 The universe is discovering your compatibility...
compatibilities-user-generating = ✨ The universe is revealing compatibility...
compatibilities-error = ⚠️ Failed to calculate compatibility. Please try later.
compatibilities-guest-success = ✅ Compatibility calculated!
compatibilities-premium-section-locked = 🔒 This section is available only for premium users. Subscribe or unlock the full compatibility report separately to learn more about your relationship.

## Compatibility Sections Headers
compatibilities-section-introduction = 🌟 Introduction
compatibilities-section-profiles = 👤 Participants Profiles
compatibilities-section-element-balance = ⚖️ Element Balance
compatibilities-section-tense-aspects = ⚡ Tense Aspects
compatibilities-section-harmonious-aspects = 🌈 Harmonious Aspects
compatibilities-section-house-overlays = 🏠 House Overlays
compatibilities-section-intimacy = 💋 Intimacy
compatibilities-section-finances = 💰 Finances
compatibilities-section-infidelity = 💔 Fidelity and Infidelity
compatibilities-section-composite-chart = 🔮 Composite Chart
compatibilities-section-conclusions = 📝 Conclusions and Recommendations

## Compatibility Buttons
compatibilities-button-unlock-full = 🔓 Unlock Full Analysis

## Compatibility Lists
compatibilities-your-compatibilities = Your Compatibilities
compatibilities-no-compatibilities = You don't have any calculated compatibilities yet

## Locale
locale-code = en-US

## Errors

error-quota-limit = ⚠️ Request quota limit reached. Please try again later.


## Utils
fetching = The Universe thinks...


cancel = Cancel
skip = Skip
