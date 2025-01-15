// Módulos Externos
const chalk = require('chalk');
const inquirer = require('inquirer');

// Módulos Internos
const fs = require('fs');

// Aplicação
operation();

//Função que "Liga" a aplicação
function operation() {
    
    inquirer.prompt(
        [
            {
                type: 'list',
                name: 'action',
                message: 'Qual operação você deseja realizar?',
                choices: [
                    'Criar Conta',
                    'Consultar Saldo',
                    'Depositar',
                    'Sacar',
                    'Sair'
                ],
            },
        ]
    )
    .then((answer) => {
        const action = answer['action'];

        if (action === 'Criar Conta') {
            createAccount();
        } else if (action === 'Depositar') {
            deposit();
        } else if (action === 'Consultar Saldo') {
            getAccountBalance();
        } else if (action === 'Sacar') {
            withdraw();
        } else if (action === 'Sair') {
            console.clear();
            log('info', 'Obrigado por usar o Accounts Bank!!');
            process.exit();
        }
    })
    .catch(err => console.log(err))
}

// Criação de conta
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o Accounts Bank'));
    log('sucesso', 'Defina as opções da sua conta a seguir');
    buildAccount();
}
// Construção da conta
function buildAccount() {
    inquirer.prompt(
        [
            {
                name: 'accountName',
                message: 'Digite um nome para sua conta:'
            },
        ]
    )
    .then((answer) => {
        const accountName = answer['accountName']

        console.info(accountName);

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            log('erro', 'Está conta já existe, escolha outro nome!!');
            buildAccount();
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (err) {
                console.log(err);
            },
        );

        log('sucesso', 'Parabéns, a sua conta foi criada!');
        operation();
    })
    .catch(err => console.log(err))
}
// Deposito de DInheiro na conta
function deposit() {
    
    inquirer.prompt(
        [
            {
                name: 'accountName',
                message: 'Qual é o nome da sua conta?'
            },
        ]
    )
    .then((answer) => {

        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return deposit();
        }

        inquirer.prompt(
            [
                {
                    name: 'amount',
                    message: 'Quanto você deseja depositar'
                }
            ]
        )
        .then((answer) => {

            const amount = answer['amount']

            addAmount(accountName, amount)
            operation();
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}
// Verificação de existencia da conta
function checkAccount(accountName) {
    
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        log('erro', 'Esta conta não existe, escolha outro nome!');
        return false;
    }

    return true;
}
// Adição de valores a conta
function addAmount(accountName, amount) {
    
    const accountData = getAccount(accountName);

    if (!amount) {
        log('erro', 'Ocorreu um erro, tente novamente mais tarde!');        
        return deposit();
    }

    accountData. balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        },
    )

    log('sucesso', `Foi depositado um valor de R$${amount} em sua conta!`);
}
// Recupera uma conta do arquivo de contas
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON);
}
// Consulta o saldo de uma conta
function getAccountBalance() {
    
    inquirer.prompt(
        [
            {
                name: 'accountName',
                message: 'Qual é o nome da sua conta?'
            }
        ]
    )
    .then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);

        log('info', `O saldo na sua conta é de R$${accountData.balance}`)
        operation();
    })
    .catch(err => console.log(err))
}
// Função para sacar(retirar dinheiro da conta)
function withdraw() {
    
    inquirer.prompt(
        [
            {
                name: 'accountName',
                message: 'Qual é o nome da sua conta?'
            }
        ]
    )
    .then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)) {
        return withdraw();
        }

        inquirer.prompt(
            [
                {
                    name: 'ammount',
                    message: 'Quanto você deseja sacar?'
                }
            ]
        )
        .then((answer) => {
            const ammount = answer['ammount'];

            removeAmmount(accountName, ammount);
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}
// Remove o dinheiro da conta ao sacar
function removeAmmount(accountName, ammount) {
    const accountData = getAccount(accountName);

    if (!ammount) {
        log('erro', 'Ocorreu um erro, tente novamente mais tarde!');
        return withdraw();
    }

    if (accountData.balance < ammount) {
        log('erro', 'Valor Indisponível!');
    }

    accountData. balance = parseFloat(accountData.balance) - parseFloat(ammount);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )

    log('sucesso', `Foi realizado um saque no valor de R$${ammount} de sua conta!`)
    operation();
}
// Alterações pensadas e feitas por mim
// FUNÇÃO DE LOGS
function log (tipoLog, texto) {
    switch (tipoLog) {
        case 'sucesso':
            console.log(chalk.green(texto));
            break;
    
        case 'erro':
            console.log(chalk.bgRed.black(texto))
            break;
    
        case 'info':
            console.log(chalk.bgBlue.black(texto))            
            break;
    
        default:
            console.error('Erro interno ao exibir log!');
            break;
    }
}