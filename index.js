const TelegramBot = require('node-telegram-bot-api');
const token = '6620635076:AAFtiIQNW3OVFi01mGrbwHCcN2XDvsPfw4g';
const bot = new TelegramBot(token, {polling: true});
const admin = require('firebase-admin');
const serviceAccount = require('./telegram.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-login2-c7a59-default-rtdb.firebaseio.com"
});

// Define la variable db aquí, justo después de inicializar Firebase
const db = admin.database();

// Referencia al nodo específico donde quieres guardar los registros
const ref = db.ref('yunkaatoq/finanzas');

bot.onText(/\/ingreso (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const monto = parseFloat(match[1]);
    console.log(`Intento de registro de ingreso: Usuario ${chatId}, Monto: ${monto}`);
    const registro = {
      tipo: 'ingreso',
      monto: monto,
      fecha: new Date().toISOString()
    };
    ref.push(registro)
      .then(() => {
        console.log(`Ingreso de Bs${monto} registrado.`);
        return bot.sendMessage(chatId, `Ingreso de Bs${monto} registrado.`);
      })
      .catch(error => console.error('Error al registrar ingreso:', error));
});

bot.onText(/\/egreso (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const monto = parseFloat(match[1]);
    console.log(`Intento de registro de egreso: Usuario ${chatId}, Monto: ${monto}`);
    const registro = {
      tipo: 'egreso',
      monto: monto,
      fecha: new Date().toISOString()
    };
    ref.push(registro)
      .then(() => {
        console.log(`Egreso de Bs${monto} registrado.`);
        return bot.sendMessage(chatId, `Egreso de Bs${monto} registrado.`);
      })
      .catch(error => console.error('Error al registrar egreso:', error));
});

bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`Consulta de balance: Usuario ${chatId}`);
    ref.once('value')
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
        console.log(`Balance calculado: Bs${balance.toFixed(2)}`);
        return bot.sendMessage(chatId, `Tu balance actual es de Bs${balance.toFixed(2)}`);
      })
      .catch(error => console.error('Error al calcular balance:', error));
});