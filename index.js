const TelegramBot = require('node-telegram-bot-api');
const token = '6620635076:AAFtiIQNW3OVFi01mGrbwHCcN2XDvsPfw4g';
const bot = new TelegramBot(token, {polling: true});
const admin = require('firebase-admin');
const serviceAccount = require('./google-services.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-login2-c7a59-default-rtdb.firebaseio.com"
  });

// Referencia al nodo específico donde quieres guardar los registros
const ref = db.ref('yunkaatoq/finanzas');

  const db = admin.database();

  bot.onText(/\/ingreso (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const monto = parseFloat(match[1]);
    const registro = { tipo: 'ingreso', monto: monto, fecha: new Date().toISOString() };
    db.ref('registros').push(registro)
      .then(() => bot.sendMessage(chatId, `Ingreso de $${monto} registrado.`))
      .catch(error => console.error('Error al registrar ingreso:', error));
  });
  
  bot.onText(/\/egreso (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const monto = parseFloat(match[1]);
    const registro = { tipo: 'egreso', monto: monto, fecha: new Date().toISOString() };
    db.ref('registros').push(registro)
      .then(() => bot.sendMessage(chatId, `Egreso de $${monto} registrado.`))
      .catch(error => console.error('Error al registrar egreso:', error));
  });



  bot.onText(/\/balance/, (msg) => {
  const chatId = msg.chat.id;
  db.ref('registros').once('value')
    .then(snapshot => {
      let balance = 0;
      snapshot.forEach(childSnapshot => {
        const registro = childSnapshot.val();
        if (registro.tipo === 'ingreso') {
          balance += registro.monto;
        } else {
          balance -= registro.monto;
        }
      });
      bot.sendMessage(chatId, `Tu balance actual es de $${balance.toFixed(2)}`);
    })
    .catch(error => console.error('Error al calcular balance:', error));
});