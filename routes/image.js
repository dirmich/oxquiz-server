var router = require('express').Router()
const multer = require('multer')
const mongoose = require('mongoose')
const GameData = mongoose.model('gamedata')
const Present = mongoose.model('present')
// const sharp = require('sharp')
const fs = require('fs')
const rootF = __dirname+'/../uploads/'
const orgRoot = rootF+'org/'
const upload = multer({
	dest: '../uploads',
	limits: 10 * 1024 * 1024
}) // limits 10MB
const cfg= require('../config')


router.post('/upload', upload.single('file'), async(req, res) => {
	// console.log('req.file', req.file)
	// console.log('req.body', req.body)
	// return
	// console.log('req.body', req.body)
	let desc 
	try {
	// if (req.file) {
	// 	// if (cfg.resize) await resize(orgRoot+req.file.filename,rootF+req.file.filename)
	// 	console.log(req.body._id)
		if (req.body._id) {
			// let r = await Present.findByIdAndUpdate(req.body._id,{
			// 	$set:req.body
			// })
			let p = await Present.findById(req.body._id)
			let sum=0
			let history=(!p.history||p.history=='undefined')?'':p.history
			if (!p.sum||p.sum=='undefined') {
				// let g = await GameData.count(p.type)
				sum=p.ival //+g
			} else 
				sum=p.sum
			history += sum+','+req.body.ival+'|'
			sum += req.body.ival-p.ival
			let update = (req.file)?Object.assign({},req.body,{imgUrl:'/uploads/'+req.file.filename},{history:history,sum:sum})
														 :Object.assign({},req.body,{history:history,sum:sum})
			// await p.save()
			let r = await Present.findByIdAndUpdate(req.body._id,update)
			// console.log(r)
		} else {
			let item = new Present(req.body)
			await item.save()
		}
	// } 

		res.json({
			file: (req.file)?req.file:'',
			body: req.body
		})
	}
	catch(e) {
		console.log('-->',e)
		res.json({
			err: e
		})
	}
})

router.post('/list',async(req,res)=>{
	try {
		let list = await Present.find().sort({
			createdAt:-1
		})

		res.json({
			list:list
		})
	}
	catch(e) {
		res.json({
			err: e
		})
	}
})

router.get('/url/:id', async (req,res)=>{
	try {
		console.log('-->',req.params)
		const item = await Item.findById(mongo.Types.ObjectId(req.params.id))
		// console.log(item)
		let ret = "<html><body><img width='100%'src='{imgpath}'></body></html>".supplant({
			imgpath: cfg.host+'/'+item.desc.orgpath
		})
		// console.log(ret)
		res.send(ret)
	}
	catch(e) {
		console.log(e)
		res.json({
			err: e
		})
	}
})
module.exports = router
