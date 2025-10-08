## Commands

start =
    .description = Запустить бота
language =
    .description = Изменить язык
setcommands =
    .description = Установить команды бота

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
onboarding-birth-date-invalid = ⚠️ Похоже, формат другой. Используйте ДД.ММ.ГГГГ или ДД-ММ-ГГГГ (например: 15.06.1990).
onboarding-birth-time = ⏰ Теперь время рождения в формате ЧЧ:ММ или ЧЧ-ММ (например: 14:30). Если не знаете — можно пропустить.
onboarding-birth-time-invalid = ⚠️ Время не распознано. Используйте формат ЧЧ:ММ или ЧЧ-ММ (например: 14:30).
onboarding-location = 🗺️ Где вы родились? Выберите город ниже, отправьте геолокацию или введите название вручную.
onboarding-location-invalid = ⚠️ Пожалуйста, отправьте геолокацию или введите название города.
onboarding-location-not-found = 🤔 Город не найден. Попробуйте снова или выберите из списка.
onboarding-location-not-found-final = 😔 Город не найден. Давайте попробуем через координаты.
onboarding-location-not-found-try-coordinates = 🤔 Город не найден. Пожалуйста, введите координаты в формате: широта, долгота (например: 55.7558, 37.6173)
onboarding-coordinates-invalid = ⚠️ Неверный формат координат. Используйте формат: широта, долгота (например: 55.7558, 37.6173)
onboarding-location-share = 📡 Можно также отправить геолокацию — мы сами определим часовой пояс.
onboarding-validation-error = ⚠️ Не удалось обработать данные. Давайте попробуем ещё раз.
onboarding-complete = ✅ Отлично! Ваш профиль настроен.
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

errors-something-went-wrong = ⚠️ Что-то пошло не так. Попробуйте снова или обратитесь к /start
