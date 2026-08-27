const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/User')

async function createUser(req,res) {
    try{
        const {username, password, role, employeeId} = req.body
        if (!password) {
            return res.status(400).json({error: 'password is required'})

        }
        const hashedPassword = await bcrypt.hash(password,10)
        const user = await User.create({
            username,
            hashedPassword,
            role,
            employeeId,
        })
        res.status(201).json(user)
    } catch(err){
        if(err.code === 11000){
            return res.status(409).json({error:'Username or Employee Id already exists'})

        }
        if (err.name === 'ValidationError'){
            return res.status(400).json({error: err.message})
        }
        res.status(500).json({ error: err.message})
    }
}

async function getAllUsers(req,res){
    try{
        const { role } = req.query
        const filter = {}
        if(role) filter.role = role
        const users = await User.find(filter)
        .populate("employeeId", "name_en name_ar employee_code")
        .sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch(err){
        res.status(500).json({ error: err.message})
    }
}

async function getUserById(req,res){
    try{
        const {userId} = req.params
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(409).json({error:'invalid user id'})
        }
        const usre = await User.findById(userId).populate(
            'employeeId',
            'name_en name_ar employee_code'
        )
        if(!user) {
            return res.status(404).json({error:'user not found'})
        }
        res.status(200).json(user);

    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}