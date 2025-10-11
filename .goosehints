---
Source: .ruler/ruler/AGENTS.md
---
# AGENTS.md

# 📂 Архитектура проекта

Проект построен по принципам **чистой архитектуры** и **Contract First**.  
Основные слои вынесены на уровень проекта, а `bot/` хранит только специфические для Telegram элементы.

---

## 📂 Дерево проекта

```bash
src/
├── domain/                        # Чистая предметная область
│   ├── entities/                   # Сущности (User, Zodiac…)
│   └── index.ts
│
├── data/                           # Доступ к данным
│   ├── sources/                    # Источники (API, DB, fake)
│   │   ├── user-network-source/
│   │   │   ├── dto.ts              # Контракты API
│   │   │   ├── faker.ts            # Фейковые данные
│   │   │   └── user-network-source.ts
│   │   └── ...
│   ├── repositories/               # Репозитории (DTO → Domain)
│   │   └── user.repository.ts
│   └── index.ts
│
├── application/                    # Use-case слой
│   ├── services/                   # Сценарии/оркестрация
│   │   ├── user.service.ts
│   │   └── auth.service.ts
│   └── index.ts
│
├── bot/                            # Всё, что связано с Telegram
│   ├── features/                   # Фичи (user stories)
│   │   ├── onboarding/
│   │   │   ├── handlers.ts         # Обработчики апдейтов
│   │   │   ├── keyboards.ts        # Клавиатуры фичи
│   │   │   ├── middlewares.ts      # Middleware уровня фичи
│   │   │   ├── helpers.ts
│   │   │   └── index.ts
│   │   ├── language/
│   │   ├── astrology/
│   │   └── ...
│   │
│   ├── shared/                     # Общие элементы внутри бота
│   │   ├── keyboards/              # Общие клавиатуры
│   │   ├── middlewares/            # Общие middlewares
│   │   └── filters/                # Общие фильтры
│   │
│   ├── context.ts                  # DI контейнер / BotContext
│   ├── handlers/                   # Глобальные обработчики (error, commands)
│   ├── i18n.ts                     # Локализация
│   └── index.ts                    # Точка входа бота
│
├── shared/                         # Общие инструменты всего проекта
│   ├── http/                       # HttpService, interceptors
│   ├── cache/                      # CacheService (redis/in-memory)
│   ├── logger.ts
│   ├── config.ts
│   └── types/
│
├── server/                         # Hono server (webhook)
│   ├── index.ts
│   ├── environment.ts
│   └── middlewares/
│       ├── logger.ts
│       ├── request-id.ts
│       └── request-logger.ts
│
└── main.ts                         # Composition Root (сборка DI)
```

---

## 🏗️ Доменные сущности

### Принципы создания Entity

Доменные сущности находятся в `src/domain/entities/` и представляют бизнес-объекты приложения. Используются декораторы из `class-transformer` и `class-validator` для валидации и трансформации данных.

### Пример Entity - User

```ts
import { Expose, Transform, Type } from 'class-transformer'
import { IsOptional, IsInt, IsString, IsDate, IsBoolean, IsNumber } from 'class-validator'

export class User {
  @Expose()
  @IsOptional()
  @IsInt()
  id?: number

  @Expose()
  @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
  @IsOptional()
  @IsString()
  email?: string

  @Expose()
  @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
  @IsOptional()
  @IsString()
  provider?: string

  @Expose()
  @IsOptional()
  @IsString()
  socialId?: string

  @Expose()
  @IsOptional()
  @IsString()
  username?: string

  @Expose()
  @IsOptional()
  @IsString()
  firstName?: string

  @Expose()
  @IsOptional()
  @IsString()
  lastName?: string

  @Expose()
  @IsString()
  name!: string

  @Expose()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  birthDate?: Date

  @Expose()
  @IsOptional()
  @IsString()
  birthDateInput?: string

  @Expose()
  @IsOptional()
  @IsString()
  birthTime?: string

  @Expose()
  @IsOptional()
  @IsString()
  birthDateTime?: string

  @Expose()
  @IsOptional()
  @IsString()
  timezone?: string

  @Expose()
  @IsOptional()
  photo?: unknown

  @Expose()
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  latitude?: number

  @Expose()
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  longitude?: number

  @Expose()
  @IsOptional()
  @IsInt()
  zodiacId?: number

  @Expose()
  @IsOptional()
  @IsString()
  city?: string

  @Expose()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  createdAt?: Date

  @Expose()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  updatedAt?: Date

  @Expose()
  @IsBoolean()
  completedOnboarding!: boolean

  @Expose()
  @Type(() => Date)
  @IsDate()
  registrationDate!: Date

  static toDto(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      completedOnboarding: user.completedOnboarding,
      // ... другие нужные поля
    }
  }

  isOnboardingComplete(): boolean {
    return this.completedOnboarding
  }

  hasValidBirthData(): boolean {
    return !!(this.birthDate && this.birthTime && this.timezone)
  }
}
```

### Правила создания Entity

1. **Используйте декораторы для валидации:**
   - `@Expose()` - поле будет сериализовано
   - `@IsOptional()` - поле необязательное
   - `@IsString()`, `@IsInt()`, `@IsBoolean()` - типы данных
   - `@Type(() => Date)` - трансформация для дат

2. **Transform для nullable значений:**

   ```ts
   @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
   ```

3. **Обязательные поля помечаются `!`:**

   ```ts
   @IsString()
   name!: string
   ```

4. **Добавляйте статические методы и бизнес-логику:**

   ```ts
   static toDto(entity: EntityClass) { /* ... */ }

   isCompleted(): boolean { /* ... */ }
   hasRequiredData(): boolean { /* ... */ }
   ```

5. **Валидация чисел:**

   ```ts
   @IsNumber({ allowNaN: false, allowInfinity: false })
   ```

### Структура файлов domain

```bash
src/domain/
├── entities/
│   ├── user.entity.ts
│   ├── zodiac.entity.ts
│   └── index.ts
└── index.ts
```

### Экспорт entities

```ts
// src/domain/entities/index.ts
export { User } from './user.entity'
export { Zodiac } from './zodiac.entity'

// src/domain/index.ts
export * from './entities'
```

---

## 🌐 Интернационализация (i18n)

### Принципы работы с i18n

При создании любого компонента бота **обязательно**:

1. **Сначала создать текстовые сообщения** на русском и английском языках
2. **Только после этого** применять их в функциях бота

### Структура файлов локализации

```bash
locales/
├── ru.ftl                           # Русские переводы
└── en.ftl                           # Английские переводы
```

### Формат файлов `.ftl` (Fluent)

#### Базовые сообщения

```ftl
# ru.ftl
welcome = Добро пожаловать! Как дела?
help = Отправьте мне текст, и я сделаю его жирным.

# en.ftl
welcome = Welcome! How are you?
help = Send me some text and I'll make it bold.
```

#### Сообщения с параметрами

```ftl
# ru.ftl
cart-msg = В вашей корзине { $items } { $items ->
    [one] товар
    [few] товара
   *[other] товаров
}

# en.ftl
cart-msg = You have { $items } { $items ->
    [one] item
   *[other] items
} in your cart
```

#### Вложенные ключи

```ftl
# ru.ftl
language.specify-a-locale = Укажите локаль
language.invalid-locale = Неверная локаль
language.already-set = Язык уже установлен
language.language-set = Язык изменён

# en.ftl
language.specify-a-locale = Please specify a locale
language.invalid-locale = Invalid locale
language.already-set = Language already set
language.language-set = Language changed
```

### Использование в коде

#### В обработчиках

```ts
bot.command("start", async (ctx) => {
  await ctx.reply(ctx.t("welcome"));
});

bot.command("help", async (ctx) => {
  await ctx.reply(ctx.t("help"));
});
```

#### С параметрами

```ts
bot.command("cart", async (ctx) => {
  const itemCount = getUserCartCount(ctx.from.id);
  await ctx.reply(ctx.t("cart-msg", { items: itemCount }));
});
```

#### В клавиатурах

```ts
const keyboard = new InlineKeyboard()
  .text(ctx.t("button.confirm"), "confirm")
  .text(ctx.t("button.cancel"), "cancel");
```

### Правила для LLM

1. **Всегда начинать с создания текстов:**

   ```ftl
   # ru.ftl
   new-feature-msg = Новая функция доступна!

   # en.ftl
   new-feature-msg = New feature available!
   ```

2. **Затем использовать в коде:**

   ```ts
   await ctx.reply(ctx.t("new-feature-msg"));
   ```

3. **Для динамических значений использовать параметры:**

   ```ftl
   # ru.ftl
   user-profile = Профиль { $name }, возраст: { $age }

   # en.ftl
   user-profile = Profile of { $name }, age: { $age }
   ```

4. **Группировать связанные сообщения:**

   ```ftl
   # ru.ftl
   errors.network = Ошибка сети
   errors.validation = Ошибка валидации

   # en.ftl
   errors.network = Network error
   errors.validation = Validation error
   ```

### Рекомендации

- Использовать понятные ключи: `welcome`, `help`, `user-profile`
- Группировать по функциональности: `errors.*`, `buttons.*`, `messages.*`
- Учитывать множественные формы в русском языке
- Всегда проверять оба языка перед внедрением

---

## 📝 Code Style Guide (JS/TS)

### Структура проекта

#### Классы

- Каждый класс должен находиться в собственной директории
- Директория называется в kebab-case
- Имя файла класса совпадает с именем директории
- Связанные файлы (constants.ts, enums.ts, utils/, *.test.ts) располагаются рядом

✅ **Valid:**

```
├── services/
|    ├── file-service/
|    |    ├── file-service.ts
|    |    ├── constants.ts
|    |    ├── enums.ts
|    |    ├── utils/
|    |    ├── file-service.test.ts
|    |    └── index.ts
|    └── index.ts
```

❌ **Invalid:**

```
├── services/
|    ├── file-service.ts
|    ├── error-service.ts
|    └── index.ts
```

#### Вложенные структуры

- Вложенные сущности не должны содержать префиксы родителя (user-card/header/header.ts → Header, а не UserCardHeader)
- Группировка разрешена, но глубина вложенности не более 4 уровней

### Классы (JS/TS)

- Поля конструктора инициализируются через `private readonly`
- Публичные методы и свойства явно помечаются как `public`
- Именование методов и свойств соответствует правилам для функций и переменных

✅ **Valid:**

```ts
class CartService {
  constructor(private readonly paymentService: PaymentService) {}

  public pay = () => {
    this.paymentService.pay()
  }
}
```

❌ **Invalid:**

```ts
class CartService {
  private readonly paymentService: PaymentService

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService
  }

  pay = () => {
    this.paymentService.pay()
  }
}
```

### Приведение типов

#### Boolean

- Используем явное приведение: `Boolean(value)`
- Исключения: условия `if (value)` и оператор `!value`

#### Number

- Используем `Number()`, `Number.parseInt()`, `Number.parseFloat()`
- Не используем `+value`, `1 * value`

#### String

- Используем `String(value)` для приведения
- Для конкатенации — шаблонные строки

✅ **Valid:**

```ts
const str = `${name} - ${count}`
```

❌ **Invalid:**

```ts
const str = name + ' - ' + count
```

### Условные операторы

- Запрещены вложенные тернарные операторы
- Допустим один уровень тернарного оператора

✅ **Valid:**

```ts
const color = darkMode
  ? darkTheme.primary
  : lightTheme.primary
```

❌ **Invalid:**

```ts
const color = darkMode
  ? variant === 'primary'
    ? darkTheme.primary
    : darkTheme.secondary
  : ...
```

### Константы и Enums

- Глобальные константы — в UPPER_CASE
- Экспортируемые константы — только из файла constants.ts
- Enums — в отдельном файле enums.ts, в PascalCase

✅ **Valid:**

```ts
export enum UserType {
  NoAuth,
  Auth
}
```

❌ **Invalid:**

```ts
export enum userType {
  noAuth,
  auth
}
```

### TypeScript

- Используем `type`, а не `interface` (кроме случаев классов, DTO или расширения внешних типов)
- Generics называем с префиксом T: `<TError, TResult>`
- Используем `Record` вместо объектной нотации
- `any` запрещён, допускается только с комментарием
- `@ts-ignore` использовать нельзя (только с пояснением и как исключение)

### Utils

- Каждая утилита в отдельной директории
- Вспомогательные приватные функции можно хранить рядом в одном файле

✅ **Valid:**

```
├── utils/
|    ├── format-price/
|    |    ├── format-price.ts
|    |    ├── format-price.test.ts
|    |    └── index.ts
|    └── index.ts
```

❌ **Invalid:**

```
├── utils/
|    ├── format-price.ts
|    ├── format-date.ts
|    └── index.ts
```

### Главные принципы

1. **Явность** (`public`, `Boolean()`, `Number()`, `String()`)
2. **Структура** (каждая сущность — в своей директории, константы и enum в отдельных файлах)
3. **Однородность** (kebab-case для файлов, PascalCase для enums, Record вместо объектов)
4. **Простота** (нет вложенных тернарных операторов, нет глубокой вложенности директорий)

---

## 🤖 Bot Development Guidelines

### Обязательное использование grammY Framework

При создании любых фич связанных с ботом обязательно использовать:

- **grammY framework** для всех Telegram Bot API операций
- **Context7 MCP** для получения актуальной документации `/grammyjs/website`
- **Официальные примеры** и паттерны из документации grammY

### Правила разработки фич для бота

1. **Перед началом разработки:**
   - Использовать Context7 MCP для получения документации grammY по конкретной функциональности
   - Проверить существующие примеры в codebase
   - Следовать архитектуре проекта (features, handlers, keyboards)

2. **Использование API:**
   - Все обращения к Telegram Bot API только через grammY
   - Использовать типизированные методы grammY
   - Применять middleware и plugins grammY где это возможно

3. **Структура фич:**

   ```
   src/bot/features/feature-name/
   ├── handlers.ts       # Обработчики команд и сообщений
   ├── keyboards.ts      # Inline и Reply клавиатуры
   ├── middlewares.ts    # Middleware уровня фичи
   ├── helpers.ts        # Вспомогательные функции
   └── index.ts          # Экспорт фичи
   ```

4. **Обязательная документация:**
   - Использовать Context7 MCP с library `/grammyjs/website` для изучения API
   - Следовать best practices из официальной документации
   - Применять рекомендованные паттерны grammY
