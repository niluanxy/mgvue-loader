if (module.hot) {
    module.hot.accept();

    if (module.hot.status() == "idle") {
        module.hot.check(true);
    }
};