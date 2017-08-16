if (module.hot) {
    module.hot.accept();    // 当前模块启用 HMR

    var RootVue = require("vue"), extend = require("extend"),
        renderView = MagicVue.renderView, STORE, mixins, oldCom;

    if (!(STORE = window.__HOT_MG_VUE__)) {
        STORE = window.__HOT_MG_VUE__ = {};
    }

    mixins = {
        mounted: function() {
            var save = STORE["_COMID_"], name = this.$$name;

            save.instance.push({ $el: this.$el, scope: this });

            // 热更新以后，更新框架旧组件信息
            if (name && !save.update) {
                _NEWCOM_.name = name; save.update = true;
                MagicVue.component(name, _NEWCOM_);
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
        var oldObj = oldCom.object, arrays = oldCom.instance;

        // 对组件调用 包装函数，添加框架钩子
        _NEWCOM_ = MagicVue.viewFactory(_NEWCOM_);

        // 尝试更新页面组件，或者打上更新标记
        if (oldObj.name) {
            STORE["_COMID_"].update = true;
            MagicVue.component(oldObj.name, _NEWCOM_);
        } else {
            STORE["_COMID_"].update = false;
        }

        // 只样式改变时，不做处理，其它情况直接重新渲染组件
        if (oldObj.style == _NEWCOM_.style) {
            for(var i=0; i<arrays.length; i++) {
                var $view = arrays[i], $scope = $view.scope,
                    params = extend(true, {}, $scope.$$params),
                    name = $scope.$$name, render = $scope.$$render;

                // 说明组件是 view 模式调用
                if ($scope.$$viewMode == "view") {
                    $scope.$destroy(); render.parentNode.removeChild(render);
                    renderView(name, params).$$once("ready", function(scope) {
                        $view.$el = scope.$el; $view.scope = scope;
                    });
                } else {
                    var dom = document.createElement("div"), $el = $scope.$el;

                    $scope.$destroy(); // 销毁旧的组件并插入新的 DIV 作为挂载点
                    $el.parentNode.insertBefore(dom, $el);
                    $el.parentNode.removeChild($el);
                    renderView(name, params, dom).$$once("ready", function(scope) {
                        $view.$el = scope.$el; $view.scope = scope;
                    });
                }
            }
        }

        oldCom.object = _NEWCOM_; // 更新 HOT 备份中的 objec 对象
    }
}
