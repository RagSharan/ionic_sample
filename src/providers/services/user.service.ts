import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { ItemsService } from './items.service';
import { MappingsService } from './mappings.service';
import { UserCredentials, IGroups } from '../interfaces';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class UserService {

    usersRef: any = firebase.database().ref('/users');
    groupRef: any = firebase.database().ref('/userGroups');    
    singleUser: any = firebase.database().ref('/groupsPerUser');
    singleGroup: any = firebase.database().ref('/usersPerGroup');
    contactRef: any = firebase.database().ref('Contacts');
    storageRef: any = firebase.storage().ref();
    statisticsRef: any = firebase.database().ref('statistics');


    public userId: any;
    public usertype: string;
    username: string;
    filterName: string;
    filterValue: Subject<any>;
    userArray: Array<any> = [];
    groupArray: Array<any> = [];
    today: string;

    constructor(public af: AngularFireDatabase, public local: Storage, public itemService: ItemsService,
        private camera: Camera, public mappingService: MappingsService) {
        this.filterName = 'schoolName';
        this.filterValue = new Subject();
       this.today = new Date().toISOString().slice(0, 10);
                                          }

    registerUser(user: UserCredentials) {
        return firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(
            (user) => {
                firebase.database().ref('/users').child(user.uid).set({
                    userkey: user.uid,
                    email: user.email,
                });
            })
    }

    signInUser(email: string, password: string) {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    signOut() {
        return firebase.auth().signOut();
    }

    getUserRef() {
        return this.usersRef;
    }

    addUser(username: string, usertype: string, uid: string) {
        this.usersRef.child(uid).update({
            username: username,
            usertype: usertype
        });
    }

    editUser(subject: string, schoolName: string, rank: string, city: string, contactNo: string, uid: string) {
        this.usersRef.child(uid).update({
            subject: subject,
            schoolName: schoolName,
            rank: rank,
            city: city,
            contactNo: contactNo

        });
    }
   
    getLoggedInUser() {
        return firebase.auth().currentUser;
    }

    onAuthStateChanged(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    }

    resetPassword(email: string): firebase.Promise<any> {
        return firebase.auth().sendPasswordResetEmail(email);
    }

    /**
     * User Methods
     * @param userUid
     * @param cb
     */

    getUsername(userUid: string, cb) {
        let username = this.usersRef.child(userUid + '/username');
        return username.once('value', cb);
    }
    getUsertype(userUid: string) {
        this.usersRef.child(userUid + '/usertype').once('value').then((snap) => {
            this.usertype = snap.val();
        })
        return this.usertype;
    }
    getUser(userUid: string) {
        return this.usersRef.child(userUid).once('value');
    }


    getAllUsers() {
        return this.af.list('/users');
    }
    getTypeU(userId: string, cb) {
        let usertype = this.usersRef.child(userId + '/usertype');
        return usertype.once('value', cb);
    }   

    //second part

    

    
    /**
     * Create New Class
     * @param groups
     */
    createGroup(groups: IGroups) {
        var newGroupRef = this.groupRef.push();
        var groupkey = newGroupRef.key;

        newGroupRef.set({
                'key': groupkey,
                'groupName': groups.groupName,
                'about': groups.about,
                'createdby': groups.createdby,
                'dateCreated': groups.dateCreated        
        }).then(() => {
            this.setUsersPerGroup(groupkey, groups.selectedUser, groups.createdby)
            this.setGroupsPerUser(groupkey, groups.selectedUser, groups.createdby);
            this.addGroupOwnerIntoContact(groups.selectedUser)
      })
    }

    
    /**
     *users belong to the single group
     * @param groupkey
     * @param selectedUsers
     * @param owner
     */
    setUsersPerGroup(groupkey: string, selectedUsers: any, owner: string) {
        this.singleGroup.child(groupkey + '/' + owner).set(true);
        selectedUsers.forEach((userkey) => {
            this.singleGroup.child(groupkey + '/' + userkey).set(true);
        })
        
    }

    /**
     * Groups belong to the single user
     * @param groupkey
     * @param selectedUsers
     * @param owner
     */
    setGroupsPerUser(groupkey: string, selectedUsers: any, owner: string) {
        this.singleUser.child(owner + '/' + groupkey).set(true);
        selectedUsers.forEach((userkey) => {
            this.singleUser.child(userkey + '/' + groupkey).set(true);
        })
        
    }

    /**
     * Add Users into Group
     * @param groupkey
     * @param selectedUsers
     */
    addUsersInGroup(groupkey: string, selectedUsers: any) {
        selectedUsers.forEach((userkey) => {
            this.singleGroup.child(groupkey + '/' + userkey).set(true);
            this.singleUser.child(userkey + '/' + groupkey).set(true);
        })
        
        this.addGroupOwnerIntoContact(selectedUsers);
    }

    /**
     * Remove users from group
     * @param groupkey
     * @param userkey
     */
    removeUserFromGroup(groupkey: string, userkey: string) {
        this.singleGroup.child(groupkey + '/' + userkey).set(null);
        this.singleUser.child(userkey + '/' + groupkey).set(null);
    }

    /**
     * Get Groups belong to single User
     * @param userId
     * @param cb
     */
    getGroupsPerUser(userId: string, cb) {
        var self = this;
        this.singleUser.child(userId).on('child_added', snap => {
            let grpRef = self.groupRef.child(snap.key);
            grpRef.once('value', cb);
        })
        }

    /**
     * get Users key for single group
     * @param groupId
     */
    getUsersKeyPerGroup(groupId: string) {
        let userKeys: Array<string> = [];
        this.singleGroup.child(groupId).on('child_added', snap => {
            userKeys.push(snap.key);
        })
        return userKeys;
    }

    /**
     * Get Users belong to single group
     * @param groupId
     * @param cb
     */
    getUsersPerGroup(groupId: string, cb) {
        var self = this;
        self.groupArray.length = 0;
        this.singleGroup.child(groupId).on('child_added', snap => {
            let usrRef = self.usersRef.child(snap.key);
            usrRef.once('value', cb);
        })

    }
  /*  getAdminGroups(userId: string, cb) {
        var self = this;
        this.singleUser.child(userId).on('child_added', snap => {
            //let adminUserRef = self.usersRef.child(snap.key);            
            self.groupRef.child(snap.key + '/createdBy').on('child_added', snapData => {
                let usrRef = self.usersRef.child(snapData.key);
                usrRef.once('value', cb);
            })

        }) 
    }*/


    /**
     * get the user who created the group
     */
    getAdminGroupList() {
        let uid = this.getLoggedInUser().uid;
        return this.af.list('/userGroups', {
            query: {
                orderByChild: 'createdby',
                equalTo: uid
            }
        });
    }

    /**
     * Get GroupName by it's ID'
     * @param groupId
     */
    getGroupName(groupId: string) {
        return this.groupRef.child(groupId + '/groupName').once('value');
    }


    /**
     * Filter Users bassed on some criteria
     * @param filterName
     */
    getFilterValue(filterName: string): Promise<string> {
        this.userId = firebase.auth().currentUser.uid;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const schoolRef = this.usersRef.child(this.userId).child(filterName);
                schoolRef.on("value", function (snapshot) {
                    let school = snapshot.val();
                    resolve(school);
                }, function (errorObject) {
                    reject(errorObject);
                    console.log("The read failed: " + errorObject.code);
                });
            }, 0);

        });

    }
    // Get All Users of App on the basis of city
    getFilteredUsers() {
        this.getFilterValue(this.filterName).then((respo) => {
            this.filterBy(respo);
        })
        return this.af.list('/users', {
            query: {
                orderByChild: this.filterName,
                equalTo: this.filterValue
            }
        });
    }
    getFilteredUserList(cb) {
        this.getFilterValue(this.filterName).then((respo) => {
            this.filterBy(respo);
        })
        let filterVal  = this.filterValue;
        
        let userListRef = this.usersRef.orderByChild(this.filterName).equalTo(filterVal);
        userListRef.on('child_added', cb)
    }


    filterBy(filterValue: string) {
        //this.filterName.next(filterName);
        this.filterValue.next(filterValue);
    }

    setFilter(filter: string) {
        this.filterName = filter;
    }
    getFilter() {
        return this.filterName;
    }

    


    /**
     * Users contact List Method
     * @param selectedUsers
     */
    addUsersIntoContact(selectedUsers: any) {
        selectedUsers.forEach((userKey) => {
            this.contactRef.child(this.userId + '/' + userKey).set(true);       
        })
        
    }

    addGroupOwnerIntoContact(selectedUsers: any) {
        let userId = this.getLoggedInUser().uid;
        selectedUsers.forEach((userKey) => {
            this.contactRef.child(userKey + '/' + userId).set(true);
        })
    }

    getUserContactList(userId: string, cb) {
        var self = this;
        this.contactRef.child(userId).on('child_added', snap => {
            let newRef = self.usersRef.child(snap.key);
            newRef.once('value', cb);
        })
    }

    removeUserFromContact(userKey: string) {
        this.userId = this.getLoggedInUser().uid;
        this.contactRef.child(this.userId + '/' + userKey).set(null);
    }


    /**
     * Student methods
     * @param studentProfile
     */
    saveStudentProfile(studentProfile: any) {
        var newStudent = this.usersRef.push();
        var studentKey = newStudent.key;
        newStudent.set({
            'userkey': studentKey,
            'parentsKey': studentProfile.parentsKey,
            'usertype': 'student',
            'username': studentProfile.studentName,
            'schoolName': studentProfile.schoolName,
            'className': studentProfile.className,
            'city': studentProfile.city
        }).then(() => {
            this.createAndUploadDefaultImage(studentKey);
            this.usersRef.child(studentProfile.parentsKey + '/student/' + studentKey).set(true);
            })
    }
    getStudentProfile(userId: string, cb) {
        var self = this;
       return this.usersRef.child(userId + '/student').on('child_added', snap => {
            let studentRef = self.usersRef.child(snap.key);
            studentRef.once('value', cb);
        })
    }
    getStudentById(userId: string) {
        let student = this.usersRef.child(userId);
        return student.once('value');
    }


    /**
     * User Image methods
     * @param userId
     */
    getUserImage(userId: string) {
        var self = this;
        return self.storageRef.child('profiles/' + userId + '/profile.png').getDownloadURL();
    }
    createAndUploadDefaultImage(userId: string) {
        let self = this;
        let imageData = '../../assets/img/profile.png';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', imageData, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (xhr.status === 200) {
                var myBlob = xhr.response;
                // myBlob is now the blob that the object URL pointed to.
                self.startUploading(myBlob, userId);
            }
        };
        xhr.send();
    }

    startUploading(file, userId) {

        let self = this;
        var metadata = {
            contentType: 'image/png',
            name: 'profile.png',
            cacheControl: 'no-cache',
        };

        var uploadTask = self.storageRef.child('profiles/' + userId + '/profile.png').put(file, metadata);
        self.setUserImage(userId);
        
    }
    setUserImage(userId) {
        this.usersRef.child(userId).update({
            image: true
        })
    }


    

    // Get base64 Picture of User
    getPicture() {
        let base64Picture;
        let options = {
            destinationType: 0,
            sourceType: 0,
            encodingType: 0
        };

        let promise = new Promise((resolve, reject) => {
            this.camera.getPicture(options).then((imageData) => {
                base64Picture = "data:image/jpeg;base64," + imageData;
                resolve(base64Picture);
            }, (error) => {
                reject(error);
            });

        });
        return promise;
    }

    // Update Provide Picture of User
    updatePicture() {
        let uid = this.getLoggedInUser().uid;
         (uid => {
            let pictureRef = this.af.object(`/users/${uid}/image`);
            this.getPicture()
                .then((image) => {
                    pictureRef.set(image);
                });
        });
    }

    /**
     * Attendance methods
     * @param userKey
     * @param groupKey
     * @param data
     */
    setUserAttendance(userKey: string, groupKey: string, data: string) {
        return this.statisticsRef.child('Attendance').child(userKey).child(groupKey + '/' + this.today).set({
            today: this.today,
            status: data
        });
    }
    getUserAttendance(userKey: string, groupKey: string, cb) {
        let timelog = this.statisticsRef.child('Attendance').child(userKey).child(groupKey);
        timelog.once('value', cb);
    }

    getAttendance(userKey: string, groupKey: string) {
        return this.af.list('/statistics/Attendance' + '/' + userKey + '/' + groupKey);
    }
}