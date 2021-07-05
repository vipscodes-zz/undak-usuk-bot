const {
    Client, Guild
} = require('discord.js')

const client = new Client()

const PREFIX = '!'
const fs = require('fs')
const brain = require('brain.js')
const network = new brain.recurrent.LSTM()
const VERSION = '1.0.1'

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

function finished(err) {
    
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)

    client.user.setActivity('VIP member', {
        type: "LISTENING"
    }).catch(console.error)
})

client.on('message', msg => {
    let args = msg.content.substring(PREFIX.length).split(' ')
    let snts = msg.content.substring(PREFIX.length).split(' | ')
    if(!msg.content.startsWith(PREFIX)) return

    switch (args[0]) {
        case 'ping':
            msg.channel.send("Pong")
            break
        case 'belajar':
            if(args[1] == 'tambah') {
                if(args[2]) {
                    if(snts[1]) {
                        var data = fs.readFileSync('data.json')
                        var sentences = JSON.parse(data)
                        sentences[sentences.length] = {text: snts[1], category: args[2]}
                        var data = JSON.stringify(sentences, null, 2)
                        fs.writeFile('data.json', data, finished)
                        msg.channel.send(`Tambah kalimat berhasil : \nKalimat : ${snts[1]} \nKategori : ${args[2]}`)
                    } else {
                        msg.channel.send("Tambahkan argumentasi yang ke-4 dipisahkan dengan ( | ) untuk memasukan pustaka kalimat")
                    }
                } else {
                    msg.channel.send("Tambahkan argumentasi yang ke-3 untuk kategori bahasa (lemes / kasar)")
                }
            } else {
                msg.channel.send("Tambahkan argumentasi yang ke-2 untuk menambah atau menghapus data (tambah / hapus)")
            }
            break

        case 'cek':
            msg.channel.send(`Tunggu sebentar bot sedang mengecek kalimat`)
            setTimeout(() => {
                var datas = JSON.parse(fs.readFileSync('data.json'))
                const trainingData = datas.map(item => ({
                    input: item.text,
                    output: item.category
                }))
                
                network.train(trainingData, {
                    iterations: 30
                })

                var output = ''
                var kalimat = snts[1].toLowerCase()
                console.log(network.run(kalimat))
                // console.log(network.run(snts[1]))sentence.indexOf("hello") != -1
                if(network.run(kalimat) === 'kasar' || network.run(kalimat) === 'lemes') {
                    output = network.run(kalimat)
                } else {
                    output = 'Beritahu aku ini kasar / lemes'
                }
                msg.channel.send(`Kalimat : ${kalimat}\nKategori : ${output}`)
            
            }, 100)

            break
            

            
    }
})

client.login(process.env.API_TOKEN)