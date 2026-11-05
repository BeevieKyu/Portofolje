from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from apps.core.models import ContactMessage, SiteSettings

from .decorators import staff_required
from .forms import SiteSettingsForm


def dashboard_login(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('dashboard:home')

    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next')
            return redirect(next_url or 'dashboard:home')
        error = 'Feil brukernavn eller passord.'

    return render(request, 'dashboard/login.html', {
        'error': error,
        'next': request.GET.get('next', ''),
    })


@login_required
def dashboard_logout(request):
    logout(request)
    return redirect('dashboard_login')


@staff_required
def home(request):
    context = {
        'henvendelse_count': ContactMessage.objects.inbox().count(),
        'ulest_henvendelse_count': ContactMessage.objects.inbox().filter(is_read=False).count(),
    }
    return render(request, 'dashboard/home.html', context)


@staff_required
def henvendelse_list(request):
    show_spam = request.GET.get('spam') == '1'
    qs = ContactMessage.objects.spam() if show_spam else ContactMessage.objects.inbox()
    return render(request, 'dashboard/henvendelse_list.html', {
        'henvendelser': qs,
        'show_spam': show_spam,
        'spam_count': ContactMessage.objects.spam().count(),
        'inbox_count': ContactMessage.objects.inbox().count(),
    })


@staff_required
def henvendelse_detail(request, pk):
    henvendelse = get_object_or_404(ContactMessage, pk=pk)
    if not henvendelse.is_read:
        henvendelse.is_read = True
        henvendelse.save(update_fields=['is_read'])
    return render(request, 'dashboard/henvendelse_detail.html', {'henvendelse': henvendelse})


@staff_required
def henvendelse_delete(request, pk):
    henvendelse = get_object_or_404(ContactMessage, pk=pk)
    if request.method == 'POST':
        henvendelse.delete()
        messages.success(request, 'Henvendelsen ble slettet.')
    return redirect('dashboard:henvendelse_list')


@staff_required
def innstillinger(request):
    settings_obj = SiteSettings.load()
    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, instance=settings_obj)
        if form.is_valid():
            form.save()
            messages.success(request, 'Innstillingene ble lagret.')
            return redirect('dashboard:innstillinger')
    else:
        form = SiteSettingsForm(instance=settings_obj)
    return render(request, 'dashboard/innstillinger.html', {'form': form})
