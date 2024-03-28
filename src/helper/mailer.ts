import * as nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import Mail from 'nodemailer/lib/mailer';
import { BotEnum, LaterTypeEnum, LogTypeEnum, UserLanguageEnum } from './types';
import { LogService } from 'src/log/log.service';

export const sendEmail = async (
  email: string,
  laterType: LaterTypeEnum,
  lang: UserLanguageEnum,
  logService: LogService,
  bot: BotEnum,
  htmlData?: { plan?: string; days?: number },
) => {
  const client = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const html = await fs.promises.readFile(getEmailPath(laterType, lang), {
    encoding: 'utf-8',
  });

  const template = handlebars.compile(html);

  const htmlToSend = template({
    ...htmlData,
    botUrl:
      bot === BotEnum.VIBE_CITY
        ? 'https://t.me/rymars_bot'
        : 'https://t.me/hesoyam_bot',
  });

  const emailOption = {
    from: 'RYMAR',
    to: email,
    subject: getEmailSubject(laterType, lang),
    text: getEmailSubject(laterType, lang),
    html: htmlToSend,
  } as Mail.Options;

  await client.sendMail(emailOption).catch((e) =>
    logService.create({
      action: 'sendEmail',
      info: JSON.stringify(e.stack),
      type: LogTypeEnum.ERROR,
      bot,
    }),
  );
};

const getEmailSubject = (laterType: LaterTypeEnum, lang: UserLanguageEnum) => {
  switch (laterType) {
    case LaterTypeEnum.BuyPlan:
    case LaterTypeEnum.ContinueBuyingPlan:
    case LaterTypeEnum.DeclineBuyPlan:
    case LaterTypeEnum.BuyPlanWithoutChannels:
      return lang === UserLanguageEnum.UA
        ? 'Покупка плану підписки'
        : 'Покупка плана подписки';
    case LaterTypeEnum.EndPlanIn:
    case LaterTypeEnum.EndPlan:
      return lang === UserLanguageEnum.UA
        ? 'Закінчення плану підписки'
        : 'Окончание плана подписки';
  }
};

const getEmailPath = (laterType: LaterTypeEnum, lang: UserLanguageEnum) => {
  switch (laterType) {
    case LaterTypeEnum.BuyPlan:
      return lang === UserLanguageEnum.UA
        ? process.cwd() + '/src/helper/emailTemplate/BuyPlanUA.html'
        : process.cwd() + '/src/helper/emailTemplate/BuyPlanRU.html';
    case LaterTypeEnum.ContinueBuyingPlan:
      return lang === UserLanguageEnum.UA
        ? process.cwd() + '/src/helper/emailTemplate/ContinueBuyingPlanUA.html'
        : process.cwd() + '/src/helper/emailTemplate/ContinueBuyingPlanRU.html';
    case LaterTypeEnum.DeclineBuyPlan:
      return lang === UserLanguageEnum.UA
        ? process.cwd() + '/src/helper/emailTemplate/DeclineBuyPlanUA.html'
        : process.cwd() + '/src/helper/emailTemplate/DeclineBuyPlanRU.html';
    case LaterTypeEnum.EndPlanIn:
      return lang === UserLanguageEnum.UA
        ? process.cwd() + '/src/helper/emailTemplate/EndPlanInUA.html'
        : process.cwd() + '/src/helper/emailTemplate/EndPlanInRU.html';
    case LaterTypeEnum.EndPlan:
      return lang === UserLanguageEnum.UA
        ? process.cwd() + '/src/helper/emailTemplate/EndPlanUA.html'
        : process.cwd() + '/src/helper/emailTemplate/EndPlanRU.html';
    case LaterTypeEnum.BuyPlanWithoutChannels:
      return lang === UserLanguageEnum.UA
        ? process.cwd() +
            '/src/helper/emailTemplate/BuyPlanWithoutChannels.html'
        : process.cwd() +
            '/src/helper/emailTemplate/BuyPlanWithoutChannels.html';
  }
};
