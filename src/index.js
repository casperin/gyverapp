import * as superfine from 'superfine'

export var h = superfine.h
export var recycle = superfine.recycle

export function subState(state, update, path) {
    return [
        state[path],
        function updateSubState(diff) {
            var o = {}
            o[path] = diff
            return o
        }
    ]
}

var defaultConfig = {
    reducer: extend,
    shouldUpdate: shallowCompare
}

export function app(container, state, view, config) {
    var node, timeout, newState
    config = extend(defaultConfig, config)

    patch()

    function update(diff) {
        if (typeof diff === 'function') {
            diff = diff(state, update, config.payload)
        }

        // Promise
        if (typeof diff === 'object' && typeof diff.then === 'function') {
            return diff.then(update)
        }

        if (!diff) return

        newState = config.reducer(state, diff)

        if (config.shouldUpdate(state, newState)) {
            state = newState
            clearTimeout(timeout)
            timeout = setTimeout(patch, 0)
        }
    }

    function patch() {
        node = superfine.patch(node, view(state, update), container)
    }

    return update
}

function extend(a, b) {
    var out = {}
    for (var k in a) out[k] = a[k]
    for (var k in b) out[k] = b[k]
    return out
}

function shallowCompare(state, newState) {
    for (var k in newState) {
        if (newState[k] !== state[k]) {
            return true
        }
    }
    return false
}
