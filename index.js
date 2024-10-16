// Import necessary libraries
const { Telegraf } = require('telegraf');
const fs = require('fs');
const mySecret1 = process.env['BOT_API']
// Initialize bot with your Telegram token
const bot = new Telegraf(mySecret1);
const simpleGit = require('simple-git');
const cron = require('node-cron');
const git = simpleGit();
const mySecret = process.env['API_KEY']
const GITHUB_TOKEN = mySecret; // Get the token from environment variables
const REPO_URL = `https://${GITHUB_TOKEN}@github.com/Darling-Unknown/Maxibotsi.git`;
// Function to commit and push changes
async function commitAndPushChanges() {
  try {
    await git.add('./users.json'); // Add the users.json file
    await git.commit('Auto-commit changes to users.json');
    await git.push(REPO_URL, 'main'); // Push to the main branch
    console.log('Changes pushed to GitHub successfully.');
  } catch (error) {
    console.error('Error committing and pushing changes:', error);
  }
}
const { exec } = require('child_process');

// Set Git config user details
exec('git config user.name "Darling-Unknown"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error setting user name: ${error}`);
    return;
  }
  console.log(`User name set: ${stdout}`);
});

exec('git config user.email "pauluchechukwudarlington@gmail.com"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error setting user email: ${error}`);
    return;
  }
  console.log(`User email set: ${stdout}`);
});

// Schedule the function to run every 5 minutes
cron.schedule('*/5 * * * * *', () => {
  console.log('Running auto-commit task...');
  commitAndPushChanges();
});
// Load user data
let usersData = {};
const usersFile = 'users.json';

// Check if the users file exists and load it
if (fs.existsSync(usersFile)) {
    usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}
// Handle /me command for admin
bot.command('me', (ctx) => {
    console.log(`User ID: ${ctx.from.id}`); // Log the user ID for debugging
    // Check if the user is the admin
    if (ctx.from.id == '6478320664') { // Replace with your actual admin chat ID
        ctx.reply("Hey there Boss! What do you wanna do today 🫣", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Tasks upload', callback_data: 'tasks_upload' }],
                    [{ text: 'Tasks Uploaded', callback_data: 'tasks_uploaded' }],
                    [{ text: 'Log Users', callback_data: 'log_users' }],
                    [{ text: 'Claim reset', callback_data: 'claim_reset' }],
                    [{ text: 'Terminate', callback_data: 'terminate' }]
                ]
            }
        });
    } else {
        ctx.reply("You are not authorized to use this command.");
    }
});

// Start command
bot.start((ctx) => {
    // Check if the user is already registered
    if (usersData[ctx.from.id] && usersData[ctx.from.id].paymentStatus === 'Registered') {
        ctx.reply("Welcome back! Here you are open to many possibilities.\nYou not only earn straight from the bot, but you also get updated on other ways to earn on telegram and other places.\n\nBe sure to join our channel: https://t.me/cryptomax05\n\nAnd chat group: https://t.me/CryptoMAXDiscusson", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Balance', callback_data: 'balance' }],
                    [{ text: 'Tasks', callback_data: 'tasks' }],
                    [{ text: 'Support', callback_data: 'support' }],
                    [{ text: 'Friends', callback_data: 'friends' }],
                    [{ text: 'Withdrawal', callback_data: 'withdrawal' }],
                    [{ text: 'Top Earners', callback_data: 'top_earners' }],
                    [{ text: 'Claim', callback_data: 'claim' }]
                ]
            }
        });
    } else {
        ctx.reply("Here's a bot that not only gives cash for simple tasks performed but also gives crypto and crypto updates.\nClick to Continue", {
            reply_markup: {
                inline_keyboard: [[{ text: 'Continue', callback_data: 'continue' }]]
            }
        });
    }
});
    // ... (existing code)

// Handle balance request
bot.action('balance', (ctx) => {
    const userId = ctx.from.id;

    // Check if the user is registered
    if (usersData[userId] && usersData[userId].paymentStatus === 'Registered') {
        const userPoints = usersData[userId].balance || 0; // Get user points (default to 0 if not set)
        ctx.reply(`Your Total Points is ${userPoints} points.`);
    } else {
        ctx.reply("You need to be registered to check your balance.");
    }
});

// Handle support command
bot.action('support', (ctx) => {
    const supportMessage = `
If you would like your very own task to be posted then contact this number 👇👇👇

+2349013586984

Do not contact this number for any other reason or else you will be blocked. 👍😉🌟
`;
    ctx.reply(supportMessage);
});

// ... (rest of the existing code)
// Handle top earners request
bot.action('top_earners', (ctx) => {
    // Get all users and sort by balance in descending order
    const topEarners = Object.entries(usersData)
        .filter(([userId, userData]) => userData.paymentStatus === 'Registered') // Only include registered users
        .sort(([, userA], [, userB]) => userB.balance - userA.balance) // Sort by balance
        .slice(0, 10) // Get top 10 earners
        .map(([userId, userData]) => `${userData.name} --- ${userData.balance} points`); // Format the output

    // Create the response message
    let responseMessage;
    if (topEarners.length > 0) {
        responseMessage = "Top 10 Earners:\n" + topEarners.join('\n');
    } else {
        responseMessage = "No registered users found.";
    }

    ctx.reply(responseMessage);
});
// Handle claim request
bot.action('claim', (ctx) => {
    const userId = ctx.from.id;
    const currentTime = Date.now(); // Current timestamp
    const claimAmount = 50; // Points to claim

    // Check if the user is registered
    if (usersData[userId] && usersData[userId].paymentStatus === 'Registered') {
        // Check if the user is eligible to claim points
        if (!usersData[userId].lastClaim || (currentTime - usersData[userId].lastClaim) >= 24 * 60 * 60 * 1000) {
            // Update user's balance and last claim timestamp
            usersData[userId].balance += claimAmount;
            usersData[userId].lastClaim = currentTime; // Set last claim to current timestamp

            // Save updated user data
            fs.writeFileSync(usersFile, JSON.stringify(usersData));

            ctx.reply(`You have successfully claimed ${claimAmount} points! Your new balance is ${usersData[userId].balance} points.`);
        } else {
            // Calculate remaining time until the next claim
            const remainingTime = 24 * 60 * 60 * 1000 - (currentTime - usersData[userId].lastClaim);
            const remainingHours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
            const remainingMinutes = Math.floor((remainingTime / (1000 * 60)) % 60);

            ctx.reply(`You can claim your points again in ${remainingHours} hours and ${remainingMinutes} minutes.`);
        }
    } else {
        ctx.reply("You need to be registered to claim points.");
    }
});

// Handle callback data
bot.action('continue', (ctx) => {
    ctx.reply(
        "To continue with this bot, a payment of 2,000 Naira or 1.5 USDT has to be made.\n\nMake payment to this receiving information to continue:\n\n" +
        "KUDA\n2040597025\nIGBAYO, MAXWELL OGHENERO\nUQDFbAPl0wIIPh7eSpsq0bmYDqh4M5BIAurnLC-hrcafNf4w\n\n" +
        "Click continue when done!",
        {
            reply_markup: {
                inline_keyboard: [[{ text: 'Continue', callback_data: 'payment_done' }]]
            }
        }
    );
});

// Handle payment done callback
bot.action('payment_done', (ctx) => {
    ctx.reply("Submit a screenshot or receipt of proof of payment (send an image).");
});

// Handle photo upload (screenshot of payment)
bot.on('photo', (ctx) => {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

    ctx.reply("Submit your Address Name or Transaction Hash if it was crypto you sent.");

    // Save the user data
    usersData[ctx.from.id] = {
        photoId: photoId,
        name: ctx.from.first_name,
        tnxHash: null,
        paymentStatus: 'Pending',
        balance: 150
    };

    fs.writeFileSync(usersFile, JSON.stringify(usersData));
});

// Handle text input for transaction hash or name
bot.on('text', (ctx) => {
    if (usersData[ctx.from.id]) {
        usersData[ctx.from.id].tnxHash = ctx.message.text;

        // Create a combined message for the admin
        const adminMessage = `Subscription request:\nUser's Name: ${usersData[ctx.from.id].name}\nUser's Transaction Hash or Name: ${ctx.message.text}`;

        // Send subscription request to admin (replace 'ADMIN_CHAT_ID' with your admin chat ID)
        ctx.telegram.sendPhoto('6478320664', usersData[ctx.from.id].photoId, {
            caption: adminMessage,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Accept', callback_data: 'accept_' + ctx.from.id }],
                    [{ text: 'Decline', callback_data: 'decline_' + ctx.from.id }]
                ]
            }
        }).then((sentMessage) => {
            // Save the message ID for deletion later
            usersData[ctx.from.id].requestMessageId = sentMessage.message_id; 
            fs.writeFileSync(usersFile, JSON.stringify(usersData)); // Save updated user data
        });

        ctx.reply("Your payment proof and transaction information have been submitted for approval.");
    }
});

// Handle accept/decline actions from admin
bot.action(/accept_(\d+)/, (ctx) => {
    const userId = ctx.match[1];

    // Update user's payment status to Registered
    usersData[userId].paymentStatus = 'Registered';
    fs.writeFileSync(usersFile, JSON.stringify(usersData));

    // Send welcome message to the user who requested the subscription
    ctx.telegram.sendMessage(userId, "Welcome to Crypto_MAX\nHere you are open to many possibilities.\nYou not only earn straight from the bot, but you also get updated on other ways to earn on telegram and other places.\n\nBe sure to join our channel: https://t.me/cryptomax05\n\nAnd chat group: https://t.me/CryptoMAXDiscusson", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Balance', callback_data: 'balance' }],
                [{ text: 'Tasks', callback_data: 'tasks' }],
                [{ text: 'Support', callback_data: 'support' }],
                [{ text: 'Friends', callback_data: 'friends' }],
                [{ text: 'Withdrawal', callback_data: 'withdrawal' }],
                [{ text: 'Top Earners', callback_data: 'top_earners' }],
                [{ text: 'Claim', callback_data: 'claim' }]
            ]
        }
    });

    // Delete the request message from admin chat
    if (usersData[userId].requestMessageId) {
        ctx.telegram.deleteMessage('6478320664', usersData[userId].requestMessageId);
    }
});

bot.action(/decline_(\d+)/, (ctx) => {
    const userId = ctx.match[1];
    ctx.telegram.sendMessage(userId, "Your subscription request has been declined.");

    // Delete the request message from admin chat
    if (usersData[userId].requestMessageId) {
        ctx.telegram.deleteMessage('6478320664', usersData[userId].requestMessageId);
    }
});

// Start the bot
bot.launch();
console.log('Bot is running...');