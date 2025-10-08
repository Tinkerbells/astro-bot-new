## Commands

start =
    .description = Start the bot
language =
    .description = Change language
setcommands =
    .description = Set bot commands

## Welcome Feature

welcome = Welcome!

## Language Feature

language-select = Please, select your language
language-changed = Language successfully changed!

## Admin Feature

admin-commands-updated = Commands updated.

## Unhandled Feature

unhandled = Unrecognized command. Try /start

## Onboarding Feature

onboarding-start = 🌟 Welcome! Let's set up your astro profile so I can craft personalized insights.
onboarding-birth-date = 📅 Please enter your birth date in DD.MM.YYYY or DD-MM-YYYY format (e.g. 15.06.1990).
onboarding-birth-date-received = ✅ Birth date received!
onboarding-birth-date-invalid = ⚠️ That date looks off. Try DD.MM.YYYY or DD-MM-YYYY (e.g. 15.06.1990).
onboarding-birth-time = ⏰ Great! Now enter the birth time in HH:MM or HH-MM (e.g. 14:30). You can skip if you're unsure.
onboarding-birth-time-received = ✅ Birth time received!
onboarding-birth-time-invalid = ⚠️ I couldn't read the time. Use HH:MM or HH-MM (e.g. 14:30).
onboarding-birth-time-skipped = ⏭️ Birth time skipped.
onboarding-location = 🗺️ Where were you born? Choose a city below, share your location, or type the name manually.
onboarding-location-custom = ✍️ Type the name of your birth city
onboarding-location-invalid = ⚠️ Please share your location or enter a city name.
onboarding-location-not-found = 🤔 I couldn't find that city. Try again or pick from the list.
onboarding-location-not-found-try-coordinates = 🤔 City not found. Please enter coordinates in format: latitude, longitude (e.g. 55.7558, 37.6173)
onboarding-coordinates-invalid = ⚠️ Invalid coordinate format. Use format: latitude, longitude (e.g. 55.7558, 37.6173)
onboarding-location-saved = ✅ Saved your birth place: { $city }
onboarding-location-saved-coordinates = 📍 Got it! Timezone detected: { $timezone }
onboarding-location-share = 📡 You can also share your location — I’ll detect the timezone automatically.
onboarding-timezone = 🌐 Please specify a timezone in Area/City format (e.g. Europe/Moscow).
onboarding-timezone-invalid = ⚠️ That timezone doesn’t exist. Use Area/City format like Europe/Moscow.
onboarding-timezone-saved = 🌐 Timezone saved: { $timezone }
onboarding-validation-error = ⚠️ I couldn’t process that. Let’s try again.
onboarding-completed = 🎉 Profile updated!
  👤 Name: { $name }
  📅 Birth date: { $birthDate }
  ⏰ Birth time: { $birthTime }
  🌍 Timezone: { $timezone }
  📍 City: { $city }
onboarding-field-missing = —
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

profile =
    .description = Show profile and menu
profile-title = 👤 Your Profile
profile-info =
  👤 Name: { $name }
  📅 Birth date: { $birthDate }
  ⏰ Birth time: { $birthTime }
  🌍 Timezone: { $timezone }
  📍 City: { $city }
  ♈ Zodiac sign: { $zodiac }

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

## Buttons

button-skip = ⏭️ Skip

## Error Messages

errors-user-load-failed = Failed to load user data. Please try again later.
errors-something-went-wrong = ⚠️ Something went wrong. Please try again or return to /start
