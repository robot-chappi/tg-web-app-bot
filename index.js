const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6001803235:AAFij01wJhkENvJJF7D4aspxj7EwTZt2aHY';

const webAppUrl = 'https://cheerful-cucurucho-654f3e.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Заполни форму по кнопке ниже', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        });
    }

    await bot.sendMessage(chatId, 'Заполни форму по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl}}]
            ]
        }
    });

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            let subject = '';
            if (data?.subject === 'legal') {
                subject = 'Юр. лицом'
            } else {
                subject = 'Физ. лицом'
            }

            await bot.sendMessage(chatId, 'Спасибо за обратную связь!\n' +
                'Ваша страна: ' + data?.country + '\n' +
                'Ваша улица: ' + data?.street + '\n' +
                'Вы являетесь: ' + subject);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю остальную информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.log(e)
        }
    }

});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму ' + totalPrice}
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {message_text: 'Не удалось приобрести товар'}
        })
        console.log(e)
        return res.status(500).json({})
    }
})

const PORT = 8080;
app.listen(PORT, () => console.log(`server started on ${PORT}`));