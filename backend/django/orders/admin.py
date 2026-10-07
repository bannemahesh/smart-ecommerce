from django.contrib import admin

from .models import Cart, Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ("timestamp",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "quantity")
    search_fields = ("user__email", "product__name")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total",
        "payment_status",
        "order_status",
        "timestamp",
    )
    list_filter = ("payment_status", "order_status")
    search_fields = ("user__email",)
    ordering = ("-timestamp",)
    inlines = [OrderItemInline, PaymentInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "product", "quantity", "price")
    search_fields = ("product__name",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "amount",
        "payment_method",
        "transaction_id",
        "status",
        "timestamp",
    )
    list_filter = ("status", "payment_method")
    search_fields = ("transaction_id",)