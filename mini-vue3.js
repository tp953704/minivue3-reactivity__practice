
// 是否物件
const isObject = v=> v!==null && typeof v ==='object'

// 建立響應數據
function reactive(obj){
    // 確認是否是Object
    if(!isObject(obj)) return obj;
    const observed = new Proxy(obj,{
        get(target,key,receiver){
            const ret = Reflect.get(target,key,receiver);
            console.log("getter get   "+ret)
            // 收集依賴
            track(target,key)
            return reactive(ret);
        },
        set(target, key, val ,receiver){
            const ret = Reflect.set(target,key,val,receiver)
            console.log("setter set   "+ret)
            // 觸發更新
            trigger(target,key)
            return ret
        },
        deleteProperty(target, key){
            const ret = Reflect.deleteProperty(target, key)
            console.log('delete '+key+':'+ret)
            // 更新觸發
            trigger(target, key)
            return ret
         },
    })
    return observed
}

// 響應是函數陣列
const effectStack = []

// 聲明響應函數
function effect(fn){
    // 對函數進行封裝
    const rxtEffect = function(){
        // 1. 捕獲異常
        // 2. fn出現入憲
        // 3. 執行fn
        try{
            effectStack.push(rxtEffect)
            return fn()
        }finally{
            effectStack.pop()
        }
    }
    // 一開始要執行一次
    rxtEffect()
    return rxtEffect;
}
const targetMap = new WeakMap()
// 依賴收集，建立 數據 & 映射關系
function track(target,key){
    // 存入映射關系
    const effectFn = effectStack[effectStack.length - 1] //拿出現頂函數
    if(effectFn){
        let depsMap = targetMap.get(target);
        
        if(!depsMap){
            depsMap = new Map();
            targetMap.set(target,depsMap)
        }
        let deps = depsMap.get(key)
        if(!deps){
            deps = new Set()
            depsMap.set(key, deps)
        }
        deps.add(effectFn)
    }
}



// 觸發更新，根據映射關系執行cb
function trigger(target,key){
    const depsMap = targetMap.get(target)
    if(depsMap){
        const deps = depsMap.get(key)
        if(deps){
            deps.forEach(effect => effect())
        }
    }
}
