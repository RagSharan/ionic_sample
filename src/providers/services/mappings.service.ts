import { Injectable } from '@angular/core';

import { IThread, IComment } from '../interfaces';
import { ItemsService } from './items.service';

@Injectable()
export class MappingsService {

    constructor(private itemsService: ItemsService) { }

    getThreads(snapshot: any): Array<IThread> {
        let threads: Array<IThread> = [];
        if (snapshot.val() == null)
            return threads;

        let list = snapshot.val();

        Object.keys(snapshot.val()).map((key: any) => {
            let thread: any = list[key];
            
            threads.push({
                key: key,
                selectedGroup: thread.selectedGroup,
                topic: thread.topic,
                question: thread.question,
                subject: thread.subject,
                dateCreated: thread.dateCreated,
                user: thread.user,
                reviewDate: thread.reviewDate
            });
        });

        return threads;
    }

    getThread(snapshot: any, key: string): IThread {
        
        let thread: any = {
            key: key,
            selectedGroup: snapshot.selectedGroup,
            topic: snapshot.topic,
            question: snapshot.question,
            subject: snapshot.subject,
            dateCreated: snapshot.dateCreated,
            user: snapshot.user,
            reviewDate: snapshot.reviewDate
        };

        return thread;
    }

    getComments(snapshot: any): Array<IComment> {
        let comments: Array<IComment> = [];
        if (snapshot.val() == null)
            return comments;
        let list = snapshot.val();

        Object.keys(snapshot.val()).map((key: any) => {
            let comment: any = list[key];
            this.itemsService.groupByBoolean(comment.votes, true);

            comments.push({
                key: key,
                commentText: comment.commentText,
                thread: comment.thread,
                dateCreated: comment.dateCreated,
                user: comment.user,
                votesUp: this.itemsService.groupByBoolean(comment.votes, true),
                votesDown: this.itemsService.groupByBoolean(comment.votes, false)
            });
        });

        return comments;
    }

    getComment(snapshot: any, commentKey: string): IComment {
        let comment: IComment;

        if (snapshot.val() == null)
            return null;

        let snapshotComment = snapshot.val();
        console.log(snapshotComment);
        comment = {
            key: commentKey,
            commentText: snapshotComment.commentText,
            thread: snapshotComment.thread,
            dateCreated: snapshotComment.dateCreated,
            user: snapshotComment.user,
            votesUp: this.itemsService.groupByBoolean(snapshotComment.votes, true),
            votesDown: this.itemsService.groupByBoolean(snapshotComment.votes, false)
        };

        return comment;
    }

    getUser(snapshot: any, key: string): any {

        let user: any = {
            key: key,
            username: snapshot.username,
            email: snapshot.email,
            contactNo: snapshot.contactNo,
            rank: snapshot.rank,
            schoolName: snapshot.schoolName,
            subject: snapshot.subject,
            city: snapshot.city
                       
        };

        return user;
    }

  /*  getGroup(snapshot: any, key: string): any {
            let group: any = {
                key: key,
                groupName: snapshot.groupName,
                createdby: snapshot.createdby,
                about: snapshot.about,
                dateCreated: snapshot.dateCreated,

            };
            return group;
    }
    getStudents(snapshot: any): Array<any> {
        let students: Array<any> = [];
        if (snapshot.val() == null)
            return students;

        let list = snapshot.val();

        Object.keys(snapshot.val()).map((key: any) => {
            let student: any = list[key];
            students.push({
                'studentKey': key,
                'studentName': student.studentName,
                'schoolName': student.schoolName,
                'className': student.className,
                'city': student.city
            });
        });

        return students;

    }
    getStudent(snapshot: any, key: string): any {
        let student: any = {
            'studentKey': key,
            'studentName': snapshot.studentName,
            'schoolName': snapshot.schoolName,
            'className': snapshot.className,
            'city': snapshot.city
        };
        return student;
    }*/
}