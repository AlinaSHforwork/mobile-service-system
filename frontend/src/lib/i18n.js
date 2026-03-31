"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const translations = {
  en: {
    // Common
    appName: "Repair Service",
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    view: "View",
    search: "Search orders...",
    noResults: "No orders found",
    signOut: "Sign Out",
    back: "Back to orders",
    submit: "Submit Order",
    submitting: "Submitting...",
    deleting: "Deleting...",
    saving: "Saving...",
    send: "Send",
    sending: "...",

    // Auth
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    signInSub: "Sign in to access your account",
    registerSub: "Register as a new client",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    login: "Log In",
    register: "Register",
    loggingIn: "Signing in...",
    registering: "Creating account...",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    backHome: "← Back to home",
    demoCredentials: "Demo credentials:",
    masterAccess: "Master access: Master / 12345678",
    clientAccess: "Client access: any username / any password",
    usernameTooShort: "Username must be at least 3 characters",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",

    // Landing
    heroTitle: "Mobile Phone Repair Service",
    heroSub: "Professional phone repair services with fast turnaround times. Track your repairs, get instant quotes, and stay updated on your device status.",
    getStarted: "Get Started",
    expertRepairs: "Expert Repairs",
    expertRepairsDesc: "Certified technicians with years of experience in mobile device repair",
    fastService: "Fast Service",
    fastServiceDesc: "Most repairs completed within 24-48 hours with priority options available",
    warrantyIncluded: "Warranty Included",
    warrantyIncludedDesc: "All repairs come with a 90-day warranty for your peace of mind",
    ctaTitle: "Get Started",
    ctaSub: "Sign in to create a repair order or track your existing repairs",
    newCustomer: "New customer? Sign in with any credentials to get started",

    // Client
    myOrders: "My Repair Orders",
    totalOrders: "Total Orders",
    inProgress: "In Progress",
    completed: "Completed",
    newOrder: "New Order",
    createOrder: "Create Order",
    noOrdersYet: "No orders yet",
    createFirst: "Create your first repair order",
    noOrdersSearch: "No orders match your search",

    // Order status labels
    statusNew: "New",
    statusAwaitingResponse: "Awaiting Your Response",
    statusAwaitingParts: "Awaiting Parts",
    statusInProgress: "In Progress",
    statusFailed: "Failed",
    statusDone: "Done",

    // Create order
    newRepairOrder: "New Repair Order",
    fillDetails: "Fill in the details about your device and the issue",
    deviceInfo: "Device Information",
    deviceType: "Device Type",
    deviceModel: "Device Model",
    deviceModelPlaceholder: "e.g. Samsung Galaxy S23, iPhone 14 Pro",
    osVersion: "OS Version",
    osVersionPlaceholder: "e.g. Android 14, iOS 17.2",
    dateOfPurchase: "Date of Purchase",
    issueDetails: "Issue Details",
    describeProblem: "Describe the Problem",
    describeIssuePlaceholder: "Please describe the issue in detail — what happened, when it started, any error messages...",
    deviceModelRequired: "Device model is required",
    osVersionRequired: "OS version is required",
    issueDescriptionRequired: "Issue description is required",
    issueTooShort: "Please describe the issue in at least 10 characters",
    networkError: "Network error. Please try again.",
    submitSuccess: "Order submitted successfully",

    // Order detail
    repairProgress: "Repair Progress",
    orderDetails: "Order Details",
    purchaseDate: "Date of Purchase",
    technicianNote: "Technician's Note",
    estimatedCost: "Estimated cost",
    chatWithTech: "Chat with",
    noMessages: "No messages yet. Start a conversation!",
    typeMessage: "Type a message...",
    techAssignedSoon: "A technician will be assigned to this order soon. Chat will be available then.",
    deleteOrder: "🗑️ Delete Order",
    deleteConfirm: "Are you sure you want to delete this order?",
    orderNotFound: "Order not found",

    // Master
    repairOrders: "Repair Orders",
    newOrdersWaiting: "new order(s) waiting",
    awaitingClientResponse: "awaiting client response",
    allOrders: "All Orders",
    available: "Available",
    myAssignedOrders: "My Orders",
    allStatuses: "All statuses",
    technician: "Technician",
    claim: "Claim",
    updateOrder: "Update Order",
    status: "Status",
    repairCost: "Repair Cost (optional)",
    techComment: "Technician Comment",
    techCommentPlaceholder: "Add diagnostic notes, repair details, or instructions for the client...",
    saveChanges: " Save Changes",
    orderUpdated: "✓ Order updated successfully",
    orderID: "Order ID",
    created: "Created",
    clientID: "Client ID",
    issueReported: "Issue Reported",
    currentTechNote: "Current Technician Note",
    chatWithClient: "Chat with",
    deviceInfo2: "Device / Issue",
    costCol: "Cost",
    actionCol: "Action",
    page: "Page",
    of: "of",
    prevPage: "← Prev",
    nextPage: "Next →",
    awaitingClientFull: "Awaiting Client",
    awaitingPartsFull: "Awaiting Parts",

    // Roles
    client: "Client",
    master: "Master",

    // Additional
    creatingOrder: "Creating order...",
    deletingOrder: "Deleting order...",
    // Roles
    client: "Client",
    master: "Master",

    // Additional
    creatingOrder: "Creating order...",
    deletingOrder: "Deleting order...",
    // Settings panel
    settings: "Settings",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    language: "Language",
    themeToggle: "Toggle theme",
  },

  uk: {
    // Common
    appName: "Сервіс Ремонту",
    loading: "Завантаження...",
    error: "Помилка",
    save: "Зберегти",
    cancel: "Скасувати",
    delete: "Видалити",
    edit: "Редагувати",
    close: "Закрити",
    view: "Перегляд",
    search: "Пошук замовлень...",
    noResults: "Замовлень не знайдено",
    signOut: "Вийти",
    back: "Назад до замовлень",
    submit: "Подати замовлення",
    submitting: "Подається...",
    deleting: "Видаляється...",
    saving: "Зберігається...",
    send: "Надіслати",
    sending: "...",

    // Auth
    welcomeBack: "Ласкаво просимо",
    createAccount: "Створити акаунт",
    signInSub: "Увійдіть до свого акаунту",
    registerSub: "Зареєструватися як клієнт",
    username: "Ім'я користувача",
    password: "Пароль",
    confirmPassword: "Підтвердіть пароль",
    login: "Увійти",
    register: "Реєстрація",
    loggingIn: "Вхід...",
    registering: "Створення акаунту...",
    noAccount: "Немає акаунту?",
    hasAccount: "Вже є акаунт?",
    backHome: "← На головну",
    demoCredentials: "Тестові дані:",
    masterAccess: "Майстер: Master / 12345678",
    clientAccess: "Клієнт: будь-яке ім'я / будь-який пароль",
    usernameRequired: "Ім'я користувача обов'язкове",
    passwordRequired: "Пароль обов'язковий",
    usernameTooShort: "Ім'я користувача мінімум 3 символи",
    passwordTooShort: "Пароль мінімум 6 символів",
    passwordMismatch: "Паролі не збігаються",

    // Landing
    heroTitle: "Сервіс Ремонту Мобільних Телефонів",
    heroSub: "Професійний ремонт телефонів із швидкими термінами. Відстежуйте ремонт, отримуйте миттєві кошториси та слідкуйте за статусом пристрою.",
    getStarted: "Почати",
    expertRepairs: "Досвідчені майстри",
    expertRepairsDesc: "Сертифіковані техніки з багаторічним досвідом ремонту мобільних пристроїв",
    fastService: "Швидкий сервіс",
    fastServiceDesc: "Більшість ремонтів виконується протягом 24-48 годин",
    warrantyIncluded: "Гарантія включена",
    warrantyIncludedDesc: "Усі ремонти надходять із 90-денною гарантією",
    ctaTitle: "Почати",
    ctaSub: "Увійдіть, щоб створити замовлення або відстежити поточні ремонти",
    newCustomer: "Новий клієнт? Увійдіть з будь-якими даними",

    // Client
    myOrders: "Мої замовлення на ремонт",
    totalOrders: "Всього замовлень",
    inProgress: "В роботі",
    completed: "Завершено",
    newOrder: "Нове замовлення",
    createOrder: "Створити замовлення",
    noOrdersYet: "Замовлень поки немає",
    createFirst: "Створіть своє перше замовлення на ремонт",
    noOrdersSearch: "Замовлень за пошуком не знайдено",

    // Order status labels
    statusNew: "Нове",
    statusAwaitingResponse: "Очікує відповіді",
    statusAwaitingParts: "Очікує запчастин",
    statusInProgress: "В роботі",
    statusFailed: "Не вдалося",
    statusDone: "Готово",

    // Create order
    newRepairOrder: "Нове замовлення на ремонт",
    fillDetails: "Заповніть інформацію про пристрій та проблему",
    deviceInfo: "Інформація про пристрій",
    deviceType: "Тип пристрою",
    deviceModel: "Модель пристрою",
    deviceModelPlaceholder: "напр. Samsung Galaxy S23, iPhone 14 Pro",
    osVersion: "Версія ОС",
    osVersionPlaceholder: "напр. Android 14, iOS 17.2",
    dateOfPurchase: "Дата придбання",
    issueDetails: "Деталі проблеми",
    describeProblem: "Опишіть проблему",
    describeIssuePlaceholder: "Опишіть проблему детально — що сталося, коли почалося, які помилки з'являються...",
    deviceModelRequired: "Модель пристрою обов'язкова",
    osVersionRequired: "Версія ОС обов'язкова",
    issueDescriptionRequired: "Опис проблеми обов'язковий",
    issueTooShort: "Опишіть проблему щонайменше 10 символами",
    networkError: "Помилка мережі. Спробуйте ще раз.",
    submitSuccess: "Замовлення успішно подано",

    // Order detail
    repairProgress: "Прогрес ремонту",
    orderDetails: "Деталі замовлення",
    purchaseDate: "Дата придбання",
    technicianNote: "Примітка майстра",
    estimatedCost: "Орієнтовна вартість",
    chatWithTech: "Чат з",
    noMessages: "Повідомлень ще немає. Почніть розмову!",
    typeMessage: "Введіть повідомлення...",
    techAssignedSoon: "Майстра незабаром призначать. Чат буде доступний після цього.",
    deleteOrder: "🗑️ Видалити замовлення",
    deleteConfirm: "Ви впевнені, що хочете видалити це замовлення?",
    orderNotFound: "Замовлення не знайдено",

    // Master
    repairOrders: "Замовлення на ремонт",
    newOrdersWaiting: "нових замовлень очікують",
    awaitingClientResponse: "очікують відповіді клієнта",
    allOrders: "Всі замовлення",
    available: "Доступні",
    myAssignedOrders: "Мої замовлення",
    allStatuses: "Всі статуси",
    technician: "Технік",
    claim: "Взяти",
    updateOrder: "Оновити замовлення",
    status: "Статус",
    repairCost: "Вартість ремонту (необов'язково)",
    techComment: "Примітка майстра",
    techCommentPlaceholder: "Додайте нотатки діагностики, деталі ремонту або інструкції для клієнта...",
    saveChanges: "Зберегти зміни",
    orderUpdated: "✓ Замовлення успішно оновлено",
    orderID: "ID замовлення",
    created: "Створено",
    clientID: "ID клієнта",
    issueReported: "Заявлена проблема",
    currentTechNote: "Поточна примітка майстра",
    chatWithClient: "Чат з",
    deviceInfo2: "Пристрій / Проблема",
    costCol: "Вартість",
    actionCol: "Дія",
    page: "Сторінка",
    of: "з",
    prevPage: "← Назад",
    nextPage: "Вперед →",
    awaitingClientFull: "Очікує клієнта",
    awaitingPartsFull: "Очікує запчастин",

    // Roles
    client: "Клієнт",
    master: "Майстер",

    // Additional
    creatingOrder: "Створення замовлення...",
    deletingOrder: "Видалення замовлення...",

    // Settings panel
    settings: "Налаштування",
    theme: "Тема",
    lightTheme: "Світла",
    darkTheme: "Темна",
    language: "Мова",
    themeToggle: "Перемкнути тему",
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lang") || "en";
    setLang(stored);
  }, []);

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const t = (key) => translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;

  if (!mounted) return null;

  return (
    <I18nContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};