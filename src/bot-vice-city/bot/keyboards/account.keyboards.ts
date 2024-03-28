import TelegramBot from 'node-telegram-bot-api';
import { User } from '../../user/user.entity';
import { UserLanguageEnum } from 'src/helper';

export const admins = ['andrew_kk', 'rymar', 'rymar_m'];

export const sendAccountKeyboard = async (
  chat_id: number,
  message_id: number,
  bot: TelegramBot,
  user: User,
  edit = false,
) => {
  const text = getAccountTitle(user);

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

  if (!edit) {
    await bot.sendMessage(chat_id, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard,
      },
    });
  } else {
    await bot.editMessageText(text, {
      chat_id,
      message_id,
      parse_mode: 'HTML',
    });

    await bot.editMessageReplyMarkup(
      {
        inline_keyboard,
      },
      {
        chat_id,
        message_id,
      },
    );
  }
};

const getAccountTitle = (user: User) => {
  switch (user.language) {
    case UserLanguageEnum.EN:
      return `👤 My account
- <b>ID</b>: ${user.id}      
- <b>Telegram ID</b>: ${user.chat_id}  
- <b>Telegram nickname</b>: @${user.name}    
- <b>Language</b>: ${user.language}      
- <b>Email</b>: ${user.email}      
`;
    // - Timezone: ${user.timezone}

    case UserLanguageEnum.RU:
      return `👤 Мой аккаунт
- <b>ID</b>: ${user.id}      
- <b>Telegram ID</b>: ${user.chat_id}   
- <b>Telegram nickname</b>: @${user.name}   
- <b>Язык</b>: ${user.language}      
- <b>Почта</b>: ${user.email}      
`;
    // - Часовой пояс: ${user.timezone}

    case UserLanguageEnum.UA:
      return `👤 Мій аккаунт
- <b>ID</b>: ${user.id}      
- <b>Telegram ID</b>: ${user.chat_id}  
- <b>Telegram nickname</b>: @${user.name}    
- <b>Мова</b>: ${user.language}      
- <b>Пошта</b>: ${user.email}      
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
