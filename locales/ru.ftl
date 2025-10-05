## Commands

start =
    .description = Запустить бота
language =
    .description = Изменить язык
setcommands =
    .description = Установить команды бота

## Welcome Feature

welcome = Добро пожаловать!

## Language Feature

language-select = Пожалуйста, выберите ваш язык
language-changed = Язык успешно изменен!

## Admin Feature

admin-commands-updated = Команды обновлены.

## Unhandled Feature

unhandled = Нераспознанная команда. Попробуйте /start

## Onboarding Feature

onboarding-start = 🌟 Добро пожаловать! Давайте настроим ваш астропрофиль и подготовим персональные прогнозы.
onboarding-birth-date = 📅 Введите дату рождения в формате ДД.ММ.ГГГГ или ДД-ММ-ГГГГ (например: 15.06.1990).
onboarding-birth-date-received = ✅ Дата рождения получена!
onboarding-birth-date-invalid = ⚠️ Похоже, формат другой. Используйте ДД.ММ.ГГГГ или ДД-ММ-ГГГГ (например: 15.06.1990).
onboarding-birth-time = ⏰ Теперь время рождения в формате ЧЧ:ММ или ЧЧ-ММ (например: 14:30). Если не знаете — можно пропустить.
onboarding-birth-time-received = ✅ Время рождения получено!
onboarding-birth-time-invalid = ⚠️ Время не распознано. Используйте формат ЧЧ:ММ или ЧЧ-ММ (например: 14:30).
onboarding-birth-time-skipped = ⏭️ Пропускаем время рождения. Мы подставим 00:00, чтобы завершить профиль.
onboarding-location = 🗺️ Где вы родились? Выберите город ниже, отправьте геолокацию или введите название вручную.
onboarding-location-custom = ✍️ Введите название города рождения
onboarding-location-invalid = ⚠️ Пожалуйста, отправьте геолокацию или введите название города.
onboarding-location-not-found = 🤔 Город не найден. Попробуйте снова или выберите из списка.
onboarding-location-saved = ✅ Записал место рождения: { $city }
onboarding-location-saved-coordinates = 📍 Сохранил координаты и часовой пояс: { $timezone }
onboarding-location-share = 📡 Можно также отправить геолокацию — мы сами определим часовой пояс.
onboarding-timezone = 🌐 Укажите часовой пояс в формате Area/City (например: Europe/Moscow).
onboarding-timezone-invalid = ⚠️ Не нашёл такой пояс. Используйте формат Area/City, например: Europe/Moscow.
onboarding-timezone-saved = 🌐 Часовой пояс сохранён: { $timezone }
onboarding-validation-error = ⚠️ Не удалось обработать данные. Давайте попробуем ещё раз.
onboarding-completed = 🎉 Профиль обновлён!
  👤 Имя: { $name }
  📅 Дата рождения: { $birthDate }
  ⏰ Время рождения: { $birthTime }
  🌍 Часовой пояс: { $timezone }
  📍 Город: { $city }
onboarding-field-missing = —
onboarding-skip = Пропустить
onboarding-location-request = 📡 Отправить геолокацию

## Zodiac Signs

zodiac-aries = Овен
zodiac-taurus = Телец
zodiac-gemini = Близнецы
zodiac-cancer = Рак
zodiac-leo = Лев
zodiac-virgo = Дева
zodiac-libra = Весы
zodiac-scorpio = Скорпион
zodiac-sagittarius = Стрелец
zodiac-capricorn = Козерог
zodiac-aquarius = Водолей
zodiac-pisces = Рыбы

## Profile Feature

profile =
    .description = Показать профиль и меню
profile-title = 👤 Ваш профиль
profile-info =
  👤 Имя: { $name }
  📅 Дата рождения: { $birthDate }
  ⏰ Время рождения: { $birthTime }
  🌍 Часовой пояс: { $timezone }
  📍 Город: { $city }
  ♈ Знак зодиака: { $zodiac }

profile-menu-ascendant = 🌅 Асцендент
profile-menu-natal-chart = 🔮 Натальная карта
profile-menu-compatibility = 💕 Проверить совместимость
profile-menu-tarot = 🃏 Расклады Таро
profile-menu-settings = ⚙️ Настройки
profile-menu-restart-onboarding = 🔄 Пройти регистрацию заново

profile-ascendant-message = 🌅 Информация об Асценденте скоро появится!
profile-natal-chart-message = 🔮 Ваша натальная карта готовится!
profile-compatibility-message = 💕 Функция проверки совместимости в разработке!
profile-tarot-message = 🃏 Расклады Таро скоро будут доступны!
profile-settings-message = ⚙️ Настройки профиля
profile-restart-onboarding-message = 🔄 Начинаю регистрацию заново...

profile-field-missing = —

## Error Messages

errors-user-load-failed = Не удалось загрузить данные пользователя. Попробуйте позже.
