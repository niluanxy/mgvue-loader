if (module.hot) {
    module.hot.accept();    // 当前模块启用 HMR

    var RootVue = require("vue"), STORE, mixins, oldCom;

    if (!(STORE = window.__HOT_MG_VUE__)) {
        STORE = window.__HOT_MG_VUE__ = {};
    }

    mixins = {
        mounted: function() {
            var save = STORE["_COMID_"];

            save.instance.push({
                $el: this.$el,
                scope: this
            });

            // 热更新以后，更新框架旧组件信息
            if (this.$$name && save.update === false) {
                _NEWCOM_.name = this.$$name;
                MagicVue.component(this.$$name, _NEWCOM_);
                save.update = true;
            }
        },

        /* 组件销毁后，需要从热更新数组中移除自身 */
        beforeDestroy: function() {
            var save = STORE["_COMID_"];

            for(var i=0; i<save.instance.length; i++) {
                if (save.instance[i].scope == this) {
                    save.instance.splice(i, 1); break;
                }
            }
        }
    }

    if (Array.isArray.call(null, _NEWCOM_.mixins)) {
        _NEWCOM_.mixins.push(mixins);
    } else {
        _NEWCOM_.mixins = [mixins];
    }

    // 如果没有 render 函数，则自动创建一个
    if (typeof _NEWCOM_.template === "string") {
        _NEWCOM_.render = RootVue.compile(_NEWCOM_.template).render;
    }

    // 不存在说明是第一次引入，无需更新
    if (!(oldCom = STORE["_COMID_"])) {
        STORE["_COMID_"] = { update: false, object: _NEWCOM_, instance: [] };
    } else {
        var oldObj = oldCom.object, arrays = oldCom.instance, name = oldObj.name;

        // 尝试复制旧组件的 name 属性到新组件
        if (name) {
            _NEWCOM_.name = name;
            MagicVue.component(name, _NEWCOM_);
            oldCom.update = true;
        } else {
            oldCom.update = false;
        }

        // 只修改了 template 属性，则重新渲染即可
        if (oldObj.template != _NEWCOM_.template) {
            for(var i=0; i<arrays.length; i++) {
                var $scope = arrays[i].scope;

                $scope.$options.render = _NEWCOM_.render;
                $scope.$options.staticRenderFns = _NEWCOM_.staticRenderFns;
                $scope._staticTrees = [];
                $scope.$forceUpdate();
            }
        } else if (_AUTO_RELOAD_) {
            location.reload();  // 如果不能和更新，尝试直接刷新页面
        } else {
            console.warn('[MGAPP] View options change, need full reload!');
        }

        oldCom.object = _NEWCOM_; // 更新 HOT 备份中的 objec 对象
    }
}
