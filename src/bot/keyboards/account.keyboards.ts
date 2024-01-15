import TelegramBot from 'node-telegram-bot-api';
import { User } from '../../user/user.entity';
import { UserLanguageEnum } from 'src/helper';

export const admins = ['andrew_kk', 'rymar'];

export const sendAccountKeyboard = async (
  id: number,
  bot: TelegramBot,
  user: User,
) => {
  const title = getAccountTitle(user);

  const inline_keyboard = [
    [
      {
        text: getAccountLanguage(user),
        callback_data: 'ChangeLanguageMenu',
      },
      // {
      //   text: getAccountTimezone(user),
      //   callback_data: 'ChangeTimezoneMenu',
      // },
    ],
    [
      {
        text: getAccountEmail(user),
        callback_data: 'ChangeEmailMessage',
      },
    ],
  ];

  if (admins.includes(user.name)) {
    inline_keyboard.push([
      {
        text:
          user.language === UserLanguageEnum.EN
            ? '‼️ Admin panel'
            : user.language === UserLanguageEnum.UA
              ? '‼️ Панель адміністратора'
              : '‼️ Админ-панель',
        callback_data: 'AdminPanel',
      },
    ]);
  }

  await bot.sendMessage(id, title, {
    reply_markup: {
      inline_keyboard,
    },
  });
};

const getAccountTitle = (user: User) => {
  switch (user.language) {
    case UserLanguageEnum.EN:
      return `👤 My account
- ID: ${user.id}      
- Telegram ID: ${user.chat_id}  
- Telegram nickname: ${user.name}    
- Language: ${user.language}      
- Email: ${user.email}      
`;
    // - Timezone: ${user.timezone}

    case UserLanguageEnum.RU:
      return `👤 Мой аккаунт
- ID: ${user.id}      
- Telegram ID: ${user.chat_id}   
- Telegram nickname: ${user.name}   
- Язык: ${user.language}      
- Почта: ${user.email}      
`;
    // - Часовой пояс: ${user.timezone}

    case UserLanguageEnum.UA:
      return `👤 Мій аккаунт
- ID: ${user.id}      
- Telegram ID: ${user.chat_id}  
- Telegram nickname: ${user.name}    
- Мова: ${user.language}      
- Пошта: ${user.email}      
`;
    // - Часовий пояс: ${user.timezone}
  }
};

const getAccountLanguage = (user: User) => {
  switch (user.language) {
    case UserLanguageEnum.EN:
      return `🌎 Language`;

    case UserLanguageEnum.RU:
      return `🌎 Язык`;

    case UserLanguageEnum.UA:
      return `🌎 Мова`;
  }
};

// const getAccountTimezone = (user: User) => {
//   switch (user.language) {
//     case UserLanguageEnum.EN:
//       return `Timezone`;

//     case UserLanguageEnum.RU:
//       return `Часовой пояс`;

//     case UserLanguageEnum.UA:
//       return `Часовий пояс`;
//   }
// };

const getAccountEmail = (user: User) => {
  switch (user.language) {
    case UserLanguageEnum.EN:
      return `📧 Email`;

    case UserLanguageEnum.RU:
      return `📧 Почта`;

    case UserLanguageEnum.UA:
      return `📧 Пошта`;
  }
};
