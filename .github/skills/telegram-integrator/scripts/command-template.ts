// Template: Telegram Command Module
// Copy this template when creating a new bot command

import { Composer } from 'grammy';
import type { DaemonContext } from '../bot.js';
import { MessageBuilder } from '../message-builder.js';

// Replace 'example' with your command name
export const exampleCommand = new Composer<DaemonContext>();

exampleCommand.command('example', async (ctx) => {
  // Access daemon state via context
  // const daemon = ctx.daemon;

  const msg = new MessageBuilder()
    .header('🔧', 'Command Title')
    .blank()
    .line('Command response body')
    .blank();

  await ctx.reply(msg.build(), { parse_mode: 'MarkdownV2' });
});
