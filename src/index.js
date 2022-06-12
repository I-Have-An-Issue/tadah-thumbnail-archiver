const axios = require("axios")
const fs = require("fs")

const wait = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

if (isNaN(Number(process.argv[2]))) return writeLog("Argument must be a number!")

try {
	fs.statSync("images")
} catch (_) {
	fs.mkdirSync("images")
}

try {
	fs.statSync("images/body")
} catch (_) {
	fs.mkdirSync("images/body")
}

try {
	fs.statSync("images/headshot")
} catch (_) {
	fs.mkdirSync("images/headshot")
}

const logStream = fs.createWriteStream("images/stdout.log")
const writeLog = (txt) => {
	logStream.write(txt + "\n")
	console.log(txt)
}

;(async () => {
	for (let i = Number(process.argv[3] || 1); i < Number(process.argv[2]) + 1; i++) {
		const thumbnails = (await axios({ url: `https://tadah.rocks/api/thumbnail?id=${i}&type=user`, validateStatus: false }).catch((e) => null)).data
		if (thumbnails.status !== 0) {
			writeLog(`${i} does not have valid renders.`)
			continue
		}
		const body = (await axios({ url: thumbnails.result.body, responseType: "arraybuffer", validateStatus: false }).catch((e) => null)).data
		const headshot = (await axios({ url: thumbnails.result.headshot, responseType: "arraybuffer", validateStatus: false }).catch((e) => null)).data
		if (!body || !headshot || body.length < 1000 || headshot.length < 1000) {
			writeLog(`${i} does not have valid renders.`)
			continue
		}
		fs.writeFileSync(`images/body/${i}.png`, body)
		fs.writeFileSync(`images/headshot/${i}.png`, headshot)
		writeLog(`${i} successfully archived.`)
		await wait(50)
	}
})()
