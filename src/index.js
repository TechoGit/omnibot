'use strict';
import 'babel-polyfill';
import * as dotenv from 'dotenv';
import { isNil } from 'lodash';
import { Bot } from './core/bot';
import { loadConfig } from './core/config';
import { createDatabase } from './core/database';
import { createLogger } from './core/logger';

import { EchoParser } from './parser/echoParser';
import { HelpHandler } from './handler/helpHandler';
import { ChooseHandler } from './handler/chooseHandler';
import { RestartHandler } from './handler/restartHandler';
import { SplitParser } from './parser/splitParser';
import { EchoHandler } from './handler/echoHandler';
import { UrbanHandler } from './handler/urbanHandler';
import { BadWordFilter } from './filter/badWordFilter';
import { DefineHandler } from './handler/defineHandler';
import { UserActionHandler } from './handler/userActionHandler';
import { AnnouncementHandler } from './handler/announcementHandler';
import { RemindmeHandler } from './handler/remindmeHandler';

import { ReactionHandler } from './reaction/reactionHandler';
import { ChannelReactionWatcher } from './watcher/channelReactionWatcher';

dotenv.config();

const logger = createLogger();
const config = loadConfig('./build/config.yml');
const database = createDatabase();
const bot = new Bot(logger);

database.sequelize.authenticate().then((errors) => {
  if (!isNil(errors)) {
    logger.error({ errors }, 'Failed to connect to database');
    process.exit();
  }
});

// register parsers
bot.registerService(EchoParser, 'parser', config.parsers.echoParser);
bot.registerService(SplitParser, 'parser', config.parsers.splitParser);

// register handlers
bot.registerService(ChooseHandler, 'handler', config.handlers.chooseHandler);
bot.registerService(EchoHandler, 'handler', config.handlers.echoHandler);
bot.registerService(HelpHandler, 'handler', config.handlers.helpHandler);
bot.registerService(RestartHandler, 'handler', config.handlers.restartHandler);
bot.registerService(UserActionHandler, 'handler', config.handlers.userActionHandler);
bot.registerService(UrbanHandler, 'handler', config.handlers.urbanHandler);
bot.registerService(DefineHandler, 'handler', config.handlers.defineHandler);
bot.registerService(AnnouncementHandler, 'handler', config.handlers.announcementHandler);
bot.registerService(RemindmeHandler, 'handler', config.handlers.remindmeHandler);

// register filters
bot.registerService(BadWordFilter, 'filter', config.filters.badWordFilter);

// register reaction handlers
bot.registerService(ReactionHandler, 'reactionHandler', config.handlers.reactionHandler);

// register watchers
bot.registerService(ChannelReactionWatcher, 'channelReactionWatcher', config.watchers.channelReactionWatcher);

if (process.argv[2] === 'sync') {
  try {
    database.sequelize.sync(); 
  } catch (err) {
    logger.error(err);
  }
}

process.on('exit', () => {
  bot.stop();
});

bot.start();
