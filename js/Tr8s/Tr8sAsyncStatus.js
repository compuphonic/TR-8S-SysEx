export const Tr8sAsyncStatusContext = {
    PREPARING: 0,
    UPDATING_DEVICE_STATUS: 1,
    SENDING_PATTERN: 2,
    SENDING_KIT: 3,
    DELETING_TONE: 4,
    OPTIMIZING: 5,
    MAKING_BACKUP: 6,
    SAVING_BACKUP: 7,
    DOWNLOADING_FIRMWARE: 8,
    SENDING_FIRMWARE: 9
};
export class Tr8sAsyncStatus {
    constructor(a) {
        this._taskCount = a, this._finishedTaskCount = 0, this._progress = 0, this._currentTask = {
            min: 0,
            max: 100,
            progress: 0,
            ratio: 0,
            subtaskCount: 0,
            finishedSubtaskCount: 0,
            context: Tr8sAsyncStatusContext.PREPARING
        }
    }
    get context() {
        return this._currentTask.context
    }
    get progress() {
        return this._progress
    }
    setTaskContext(a) {
        this._currentTask.context = a
    }
    resetSubtaskCount(a) {
        this._currentTask.subtaskCount = a, this._currentTask.finishedSubtaskCount = 0
    }
    resetTaskProgressRange(a = 0, b = 100) {
        this._currentTask.min = a, this._currentTask.max = b, this.setTaskProgress(a)
    }
    get taskProgress() {
        return this._currentTask.progress
    }
    incTaskProgress(a = 1) {
        this.setTaskProgress(this._currentTask.progress + a)
    }
    setTaskProgress(a) {
        if (this._finishedTaskCount >= this._taskCount) return void(this._progress = 100);
        const b = this._currentTask;
        a = Math.min(b.max, Math.max(b.min, a)), b.progress = a, b.ratio = (a - b.min) / (b.max - b.min), b.subtaskCount && (b.finishedSubtaskCount >= b.subtaskCount ? b.ratio = 1 : b.ratio = (b.ratio + b.finishedSubtaskCount) / b.subtaskCount), this._progress = Math.floor(100 * ((b.ratio + this._finishedTaskCount) / this._taskCount))
    }
    finishSubtask(a = 1) {
        const b = this._currentTask;
        b.finishedSubtaskCount = Math.min(b.finishedSubtaskCount + a, b.subtaskCount), this.resetTaskProgressRange()
    }
    finishTask(a = 1) {
        this._finishedTaskCount = Math.min(this._finishedTaskCount + a, this._taskCount), this.resetSubtaskCount(), this.resetTaskProgressRange()
    }
}
