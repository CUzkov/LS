type MutexItem = {
    releaseCallback: () => void;
    repositoryFullPath: string;
};

// @FIXME разные очереди параллельно не выполняются из-за синхронности ноды, можно подумать над worker_threads
// но учесть, что при git add, git commit и мб ещё чего-то нужно блокировать репозиторий
export class Mutex {
    readonly mapOfQueue: Record<string, MutexItem[]>;

    constructor() {
        this.mapOfQueue = {};
    }

    lock(item: MutexItem) {
        if (!this.mapOfQueue[item.repositoryFullPath]?.length) {
            this.mapOfQueue[item.repositoryFullPath] = [item];
            item.releaseCallback();
        } else {
            this.mapOfQueue[item.repositoryFullPath].push(item);
        }
    }

    unlock(item: Omit<MutexItem, 'releaseCallback'>) {
        if (this.mapOfQueue[item.repositoryFullPath]?.length > 1) {
            this.mapOfQueue[item.repositoryFullPath][1].releaseCallback();
            this.mapOfQueue[item.repositoryFullPath].shift();
            return;
        }

        this.mapOfQueue[item.repositoryFullPath].shift();
    }
}
