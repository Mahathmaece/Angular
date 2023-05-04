import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { HeaderMail, Mail } from 'app/main/apps/mail/mail.model';
import { MailService } from 'app/main/apps/mail/mail.service';
import { HttpClient } from '@angular/common/http';
import { MailListService } from '../mail-list.service';
import { Folders } from '@/_models/shared/constants';
@Component({
    selector: 'mail-list',
    templateUrl: './mail-list.component.html',
    styleUrls: ['./mail-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MailListComponent implements OnInit, OnDestroy {
    mails: Mail[] = [];
    currentMail: Mail;

    config: any;
    totalRows: number;
    pageNumber: number;
    rowsOfPage: number;
    folderId: number;
    folders = Folders;
    private readonly destroy$ = new Subject<void>();

    // Private
    private _unsubscribeAll: Subject<any>;
    searchText = '';
    headerMail: HeaderMail;
    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {MailService} _mailService
     * @param {Location} _location
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _mailService: MailService,
        private _mailListService: MailListService,
        private _location: Location,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to update mails on changes
        this._mailService.onMailsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(mails => {
                debugger;
                this.mails = mails.results;
                this.totalRows = mails.totalRows;
                this.pageNumber = mails.pageNumber;
                this.rowsOfPage = mails.rowsOfPage;
                this.folderId = mails.folderId;
            });

        this.config = {
            itemsPerPage: this.rowsOfPage,
            currentPage: this.pageNumber,
            totalItems: this.totalRows
        };
        // Subscribe to update current mail on changes
        this._mailService.onCurrentMailChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currentMail => {
                if (!currentMail) {
                    // Set the current mail id to null to deselect the current mail
                    this.currentMail = null;

                    // Handle the location changes
                    const labelHandle = this._activatedRoute.snapshot.params.labelHandle,
                        filterHandle = this._activatedRoute.snapshot.params.filterHandle,
                        folderHandle = this._activatedRoute.snapshot.params.folderHandle;

                    if (labelHandle) {
                        this._location.go('apps/mail/label/' + labelHandle);
                    }
                    else if (filterHandle) {
                        this._location.go('apps/mail/filter/' + filterHandle);
                    }
                    else {
                        this._location.go('apps/mail/' + folderHandle);

                        this._mailService.onMailsChanged
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe(mails => {
                                debugger;
                                this.mails = mails.results;
                                this.totalRows = mails.totalRows;
                                this.pageNumber = mails.pageNumber;
                                this.rowsOfPage = mails.rowsOfPage;
                                this.folderId = mails.folderId;
                            });
                        this.config = {
                            itemsPerPage: this.rowsOfPage,
                            currentPage: this.pageNumber,
                            totalItems: this.totalRows
                        };
                    }
                }
                else {
                    this.currentMail = currentMail;
                }
            });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Read mail
     *
     * @param mailId
     */
    readMail(mailId): void {
        const labelHandle = this._activatedRoute.snapshot.params.labelHandle,
            filterHandle = this._activatedRoute.snapshot.params.filterHandle,
            folderHandle = this._activatedRoute.snapshot.params.folderHandle;
        if (labelHandle) {
            this._location.go('apps/mail/label/' + labelHandle + '/' + mailId);
        }
        else if (filterHandle) {
            this._location.go('apps/mail/filter/' + filterHandle + '/' + mailId);
        }
        else {
            this._location.go('apps/mail/' + folderHandle + '/' + mailId);
        }
        // Set current mail
        this._mailService.setCurrentMail(mailId);
    }
    trackById(index: number, mail: any): number {
        return mail.id;
    }
    pageChangeEvent(pageNumber: number) {
        let folderType = this._activatedRoute.snapshot.params.folderHandle;
        const folderId = this.folders.find(x => x.handle == folderType).id;
        if (pageNumber == undefined) {
            pageNumber = 1;
        }
        this._mailListService.getMailsByFolder(folderId, pageNumber, this.rowsOfPage).pipe(takeUntil(this.destroy$)).subscribe({
            next: (resp) => {
                this.config = {
                    itemsPerPage: resp.rowsOfPage,
                    currentPage: resp.pageNumber,
                    totalItems: resp.totalRows
                };
                this.headerMail = resp;
                this.headerMail.folderId = folderId;
                this.mails = this.headerMail.results;

            },
            error: (error) => {
                throw error;
            }
        })
    }
}
