---
"@zag-js/toast": minor
---

BREAKING: Simplify toast api


```diff
<ToastContext.Provider value={api}>
-    {Object.entries(api.getToastsByPlacement()).map(([placement, toasts]) => (
+    {api.getPlacements().map((placement) => (
        <div key={placement} {...api.getGroupProps({ placement })}>
-           {toasts.map((toast) => (
+           {api.getToastsByPlacement(placement).map((toast) => (
                <Toast key={toast.id} actor={toast} />
            ))}
        </div>
    ))}
    {children}
</ToastContext.Provider>
```
