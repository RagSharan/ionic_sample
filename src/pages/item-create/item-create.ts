import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NavController, ViewController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database';

import { IGroups } from '../../providers/interfaces';
import { Camera } from '@ionic-native/camera';
import { UserService } from '../../providers/services/user.service';
import { Item } from '../../models/item';
import { ItemDetailPage } from '../item-detail/item-detail';

@Component({
    selector: 'page-item-create',
    templateUrl: 'item-create.html',
    styles: [`
    .active {
      background-color: antiquewhite;
    }
  `]
})
export class ItemCreatePage implements OnInit {
    @ViewChild('fileInput') fileInput;

    isReadyToSave: boolean;
    testRadioOpen: boolean;
    item: any;
    users: FirebaseListObservable<any[]>;
    form: FormGroup;
    name: AbstractControl;
    about: AbstractControl;

    public selectedUser: Array<string> = [];
    enable: boolean = false;
    filterName: string;

    constructor(public navCtrl: NavController, public viewCtrl: ViewController,
        formBuilder: FormBuilder, public camera: Camera, navParams: NavParams,
        private userService: UserService, public alerCtrl: AlertController,) {

        this.form = formBuilder.group({
            profilePic: [''],
            'name': ['', Validators.compose([Validators.required])],
            'about': ['', Validators.compose([Validators.required, Validators.minLength(10)])],

        });

        // Watch the form for changes, and
        this.form.valueChanges.subscribe((v) => {
            this.isReadyToSave = this.form.valid;
        });
        //  this.filterName = this.userService.getFilter() || 'schoolName';
        if (this.filterName === undefined) {
            this.filterName = 'schoolName';
        }
        
    }

    ngOnInit() {
        console.log('in group creation..');
        this.userService.setFilter(this.filterName);    
        this.users = this.userService.getFilteredUsers();
        this.name = this.form.controls['name'];
        this.about = this.form.controls['about'];
    }
    reload() {
        this.userService.setFilter(this.filterName);
        this.users = this.userService.getFilteredUsers();
    }

    ionViewDidLoad() {

    }

    getPicture() {
        if (Camera['installed']()) {
            this.camera.getPicture({
                destinationType: this.camera.DestinationType.DATA_URL,
                targetWidth: 96,
                targetHeight: 96
            }).then((data) => {
                this.form.patchValue({ 'profilePic': 'data:image/jpg;base64,' + data });
            }, (err) => {
                alert('Unable to take photo');
            })
        } else {
            this.fileInput.nativeElement.click();
        }
    }

    processWebImage(event) {
        let reader = new FileReader();
        reader.onload = (readerEvent) => {

            let imageData = (readerEvent.target as any).result;
            this.form.patchValue({ 'profilePic': imageData });
        };

        reader.readAsDataURL(event.target.files[0]);
    }

    getProfileImageStyle() {
        return 'url(' + this.form.controls['profilePic'].value + ')'
    }

    /**
     * The user cancelled, so we dismiss without sending data back.
     */
    cancel() {
        this.viewCtrl.dismiss();
    }

    /**
     * The user is done and wants to create the item, so return it
     * back to the presenter.
     */
    done() {
        if (!this.form.valid) { return; }
        //this.viewCtrl.dismiss(this.form.value);
        this.createGroup(this.form.value)
        this.viewCtrl.dismiss();
    }

    createGroup(groupForm: any) {

        let uid = this.userService.getLoggedInUser().uid;
        let newGroup: IGroups = {
            groupName: groupForm.name,
            about: groupForm.about,
            createdby: uid,
            dateCreated: new Date().toString(),
            selectedUser: this.selectedUser
        };
        this.userService.createGroup(newGroup);
    }
    
    
    public selectUser(key: string): void {
        //this.selectedUser.push(key);           
        console.log("Inside select users");
        if (this.selectedUser.length !== 0) {
            this.selectedUser.forEach(element => {
                if (element === key) {
                    console.log("inside if condition")
                    this.selectedUser.splice(this.selectedUser.indexOf(key), 1);
                    this.enable = false;
                } 
                else {
                    this.selectedUser.push(key);
                    this.enable = true;
                }
                               
            })
        }
        else {
            console.log("key=" + key);
            this.selectedUser.push(key);
            this.enable = true;
        }
    }

    /**
 * Navigate to the detail page for this item.
 */
    openItem(item: Item) {
        this.navCtrl.push(ItemDetailPage, {
            item: item
        });
    }
    
    public doFilter() {
        //one problem in this function related to teacher filter
        let alert = this.alerCtrl.create();
        alert.setTitle('Search users to add in this group');

        alert.addInput({
            type: 'radio',
            label: 'School',
            value: 'schoolName',
            checked: true
        });

        alert.addInput({
            type: 'radio',
            label: 'City',
            value: 'city'
        });

        alert.addInput({
            type: 'radio',
            label: 'Teacher',
            value: 'usertype'
        });

        alert.addInput({
            type: 'radio',
            label: 'student',
            value: 'parents'
        });

        alert.addButton('Cancel');
        alert.addButton({
            text: 'Ok',
            handler: data => {
                console.log('Radio data:', data);
                 this.testRadioOpen = false;
                this.filterName = data;
                this.reload();

            }
        });

        alert.present().then(() => {
            this.testRadioOpen = true;
        });
    }
}