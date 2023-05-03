export enum FolderType {
    sent = 0,
    inbox = 1
}
export const Folders = [
    {
        'id': FolderType.inbox,
        'handle': 'inbox',
        'title': 'Inbox',
        'icon': 'inbox'
    },
    {
        'id': FolderType.sent,
        'handle': 'sent',
        'title': 'Sent',
        'icon': 'send'
    },
]