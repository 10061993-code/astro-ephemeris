// testSendMail.js
import sendWelcomeEmail from './sendWelcomeEmail.js';

const user = {
  id: 'test-123',
  name: 'Testperson',
  email: 'deine.email@gmail.com' // ➜ Hier deine echte Adresse eintragen
};

sendWelcomeEmail(user);

