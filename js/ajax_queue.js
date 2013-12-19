/* 
 * File: Queues.js 
 * Date: 11-Sep-2012 
 * By  : Kevin L. Esteb 
 * 
 * This module provides simple queue functionality. It supports 
 * FIFO and LIFO based queues. By default it is in FIFO mode. 
 * 
 * The constructor can be passed the following config: 
 * 
 *   config = { 
 *       fifo: true 
 *   }; 
 * 
 *   que = new Ext.ux.queue.Queues(config); 
 * 
 *   que.enqueue(value); 
 *   value = que.dequeue(); 
 * 
 * Where "fifo" can be either "true" or "false". When it is false, the 
 * queue is in LIFO mode. 
 * 
 * --------------------------------------------------------------------- 
 * 
 *   Queues.js is free software: you can redistribute it and/or modify it 
 *   under the terms of the GNU General Public License as published by the 
 *   Free Software Foundation, either version 3 of the License, or 
 *   (at your option) any later version. 
 * 
 *   Queues.js is distributed in the hope that it will be useful, but 
 *   WITHOUT ANY WARRANTY; without even the implied warranty of 
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU 
 *   General Public License for more details. 
 * 
 *   You should have received a copy of the GNU General Public License 
 *   along with RemoteStorageProvider.js. If not, see 
 *   <http://www.gnu.org/licenses/>. 
 * 
 * --------------------------------------------------------------------- 
 * 
 */

Ext.define('Ext.ux.queue.Queues', {

    queue: [],
    fifo: true,

    constructor: function (config) {

        config = config || {};
        this.initialConfig = config;

        Ext.apply(this, config);

    },

    enqueue: function (value) {

        this.queue.push(value);

    },

    dequeue: function () {
        var value = null;

        if (this.queue.length > 0) {

            if (this.fifo) {

                value = this.queue.pop();

            } else {

                value = this.queue.shift();

            }

        }

        return value;

    },

    peek: function (pos) {
        var value = null,
            last = this.queue.length - 1;

        if (this.queue.length > 1) {

            if (pos < 0) {

                value = this.queue[0];

            } else if (pos > last) {

                value = this.queue[last];

            } else {

                value = this.queue[pos];

            }

        }

        return value;

    },

    clear: function () {

        this.queue = [];

    },

    count: function () {

        return this.queue.length;

    }

});

/*
 * File: Manager.js
 * Date: 11-Sep-2012
 * By  : Kevin L. Esteb
 *
 * This module provides a simple queue mamanger for named queues. It is
 * implemented as a singleton. Usage is a follows:
 *
 *    qmgr = Ext.ux.queue.Manager;
 *
 *    qmgr.createQueue('ajax', {fifo: true});
 *    qmgr.addItem('ajax', value);
 *
 *    while (value = qmgr.nextItem('ajax')) {
 *
 *    }
 *
 *    qmgr.deleteQueue('ajax');
 *
 * It also exposes two events:
 *
 *    enqueued - when an item is placed into a queue.
 *    dequeued - when an item is removed from a queue.
 *
 * Both of these events provides the name of the queue that this event
 * happened on.
 *
 * ---------------------------------------------------------------------
 *
 *   Manager.js is free software: you can redistribute it and/or modify it
 *   under the terms of the GNU General Public License as published by the
 *   Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   Manager.js is distributed in the hope that it will be useful, but
 *   WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *   General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with RemoteStorageProvider.js. If not, see
 *   <http://www.gnu.org/licenses/>.
 *
 * ---------------------------------------------------------------------
 *
 */

Ext.define('Ext.ux.queue.Manager', {
    singleton: true,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        'Ext.ux.queue.Queues'
    ],
    uses: [
        'Ext.util.Observable'
    ],

    queues: [],

    constructor: function () {

        this.mixins.observable.constructor.call(this);
        this.addEvents(
            'enqueued',
            'dequeued'
        );

    },

    createQueue: function (name, config) {

        if (!this.queues[name]) {

            this.queues[name] = Ext.create('Ext.ux.queue.Queues', config);

        }

    },

    deleteQueue: function (name) {
        var queue = null;

        if (queue = this.getQueue(name)) {

            queue.clear();
            delete this.queues[name];

        } else {

            Ext.Error.raise('queue "' + name + '" is not defined');

        }

    },

    getQueue: function (name) {

        return (this.queues[name] || null);

    },

    nextItem: function (name) {
        var queue = null, value = null;

        if (queue = this.getQueue(name)) {

            value = queue.dequeue();
            this.fireEvent('dequeued', name);

        } else {

            Ext.Error.raise('queue "' + name + '" is not defined');

        }

        return value;

    },

    addItem: function (name, value) {
        var queue = null;

        if (queue = this.getQueue(name)) {

            queue.enqueue(value);
            this.fireEvent('enqueued', name);

        } else {

            Ext.Error.raise('queue "' + name + '" is not defined');

        }

    },

    countItems: function (name) {
        var count = 0, queue = null;

        if (queue = this.getQueue(name)) {

            count = queue.count();

        } else {

            Ext.Error.raise('queue "' + name + '" is not defined');

        }

        return count;

    }

});

/*
 * File: Dispatcher.js
 * Date: 11-Sep-2012
 * By  : Kevin L. Esteb
 *
 * This module provides a method to perform queued ajax requests. It is
 * implemented as a singleton. Usage is as follows:
 *
 *    var config = {
 *        pending: 2,
 *        queue: {
 *            name: 'ajax',
 *            fifo: false
 *        }
 *    };
 *
 *    Ext.ux.data.Dispatcher(config).run();
 *
 * Everything after this is event driven.
 *
 * ---------------------------------------------------------------------
 *
 *   Dispatcher.js is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   Dispatcher.js is distributed in the hope that it will be useful, but
 *   WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *   General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with RemoteStorageProvider.js. If not, see
 *   <http://www.gnu.org/licenses/>.
 *
 * ---------------------------------------------------------------------
 *
 */

Ext.define('Ext.ux.data.Dispatcher', {
    singleton: true,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        'Ext.ux.queue.Queues',
        'Ext.ux.queue.Manager'
    ],
    uses: [
        'Ext.Ajax',
        'Ext.data.proxy.Ajax',
        'Ext.util.Observable',
        'Ext.data.Connection'
    ],

    qmgr: {},
    count: 0,
    pending: 1,
    queue: {
        name: 'ajax',
        fifo: false
    },

    constructor: function (config) {

        config = config || {};
        this.initialConfig = config;

        Ext.apply(this, config);

        this.mixins.observable.constructor.call(this, config);

        this.qmgr = Ext.ux.queue.Manager;

    },

    run: function () {

        this.qmgr.createQueue(this.queue.name, {fifo: this.queue.fifo});

        // The processing of the 'ajax' queue is event driven.
        //
        // Observe Ext.data.Connection so that we can respond to it's events.

        Ext.util.Observable.observe(Ext.data.Connection);
        Ext.data.Connection.on({
            requestcomplete: {
                fn: this.completed,
                scope: this
            },
            requestexception: {
                fn: this.exception,
                scope: this
            }
        });

        // Wait for any "enqueued" events and then start processing.

        this.qmgr.on({
            enqueued: {
                fn: this.dispatch,
                scope: this
            }
        });

    },

    dispatch: function (name) {
        var request;

        if (name === this.queue.name) {

            if (this.count < this.pending) {

                if (request = this.qmgr.nextItem(this.queue.name)) {

                    if(Ext.isFunction(request.beforeStart)) {
                        request.beforeStart();
                    }

                    Ext.Ajax.request(request);
                    this.count++;

                }

            }

        }

    },

    completed: function () {

        this.count--;

        if (this.count < 0) {

            this.count = 0;

        }

        this.dispatch(this.queue.name);

    },

    exception: function () {

        this.count--;

        if (this.count < 0) {

            this.count = 0;

        }

        this.dispatch(this.queue.name);

    }

});


