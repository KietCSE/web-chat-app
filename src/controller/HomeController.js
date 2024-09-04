const { response } = require('express')
const poolConversation = require('../model/UserPoolConversation');
const User = require('../model/User')
const { multipleDataToObject } = require('../util/toObject');
const { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const {storage} = require('../config/Firebase')

class HomeController {
    HomePage(req, res, data, friend) {
        res.render('home', {layout: 'main', data:data, friend: friend })
    }

    // load list conversation of specific user by ID
    async LoadPoolConversation(id) {
        try {
            const res = await poolConversation.findOne({ pool_conversation_id: id });
            // sort for the most recent chating user 
            let list = res.people.sort((a,b) => b.number - a.number)
            return multipleDataToObject(list)
        } catch (err) {
            return 
        }
    }

    //load all user from database 
    async LoadNewFriend(slice = 0) {
        try {
            const SIZE = parseInt(process.env.SIZE_OF_SLICE_NEW_FRIEND) || 10
            const res = await User.find()
                                  .skip(slice*SIZE)
                                  .limit(SIZE)
            return multipleDataToObject(res)
        } catch (err) {
            console.log(err)
        }
    }


    /*  load all data from database to render home page: 
        data include : list friend and list new friend 
        Load all user in database, mark who is friend, who is not 
    */
    async GetDataForHomePage(curerntUserId) {
        // load list of friend 
        let listFriend = await this.LoadPoolConversation(curerntUserId)

        // load all user from database 
        let ListUser = await this.LoadNewFriend()

        let listFriendID = [] 
        listFriend.forEach(e => {
            listFriendID.push(e.id_user)
        })
        
        // create list new friend 
        let listnewFriend = [] 
        ListUser.forEach(element => {
            if (element.pool_conversation_id === curerntUserId) return 
            const idFriend = !listFriendID.includes(element.pool_conversation_id)
            listnewFriend.push({ 
                name : element.name, 
                isFriend : idFriend, 
                key : element.pool_conversation_id,
                avatar: element.avatar
            })
        });

        return {listFriend, listnewFriend}
    }
    
    /*
        upload file into firebase and return a url of this file 
    */ 
    async UpLoadFileToFirebase(file) {
        try {
            if (!file) return null
            const filename = new Date().getTime() + '-' + file.originalname;
            // if this file is an image 
            if (file.mimetype.startsWith('image')) {
                const metadata = {
                    contentType: file.mimetype
                }
                const imageRef = ref(storage, 'images/' + filename);

                return uploadBytesResumable(imageRef, file.buffer, metadata)
                            .then(snapshot => getDownloadURL(snapshot.ref))
                            .then(url => url)
            }
            // if this file is other type
            else {
                const imageRef = ref(storage, 'files/' + filename);

                return uploadBytes(imageRef, file.buffer)
                            .then(snapshot => getDownloadURL(snapshot.ref))
                            .then(url => url )               
            }
        } catch (error) {
            console.log(error)
        }
    }


    /* load more new friend when click button [MORE]*/
    async LoadMoreFriend(slice, curerntUserId) {
        try {
            // load list of friend 
            let listFriend = await this.LoadPoolConversation(curerntUserId)

            // load all user from database 
            let ListUser = await this.LoadNewFriend(slice)

            let listFriendID = [] 
            listFriend.forEach(e => {
                listFriendID.push(e.id_user)
            })

            // create list new friend 
            let listnewFriend = [] 
            ListUser.forEach(element => {
                if (element.pool_conversation_id === curerntUserId) return 
                const isFriend = listFriendID.includes(element.pool_conversation_id)
                listnewFriend.push({ 
                    name : element.name, 
                    isFriend : isFriend, 
                    key : element.pool_conversation_id,
                    avatar: element.avatar
                })
            });

            return listnewFriend
        }
        catch(err) {
            console.log(err)
        }
    }


    /* search name of new friend 
       name: name of new friend 
       currentUserId: user is searching 
    */
    async SearchFriend(substring, curerntUserId) {
        // load current friend of user 
        let listFriend = await this.LoadPoolConversation(curerntUserId)
        let listFriendID = [] 
        listFriend.forEach(e => {
            listFriendID.push(e.id_user)
        })

        // create array of condition 
        const condition = substring.map(e => (
            { name : { $regex: e, $options: 'i'} }
        ))

        // load new friend through name 
        let listnewFriend = [] 
        const data = await User.find({ $or: condition })
        if (data) {  
            data.forEach(element => {
                if (element.pool_conversation_id === curerntUserId) return 
                const isFriend = listFriendID.includes(element.pool_conversation_id)
                listnewFriend.push({ 
                    name : element.name, 
                    isFriend : isFriend, 
                    key : element.pool_conversation_id,
                    avatar: element.avatar
                })
            });
        }
        return listnewFriend
    }
}

module.exports = new HomeController