def register():
    """
        declare menuItems as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles',
        'users.Permissions@permissions_url': '/permissions',
        'users.UserTokens@user_tokens_url': '/user-tokens|/user-tokens/<user_token>',
        'users.Activate@user_activate_url': '/account/activate-pass',
        'users.Audit@audit_url': '/audit|/audit/<int:user_id>',
        'company.Company@company_url': '/company',
    }


no_permissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.UserTokens',
    'views.users.Permissions',
    'views.users.Activate',
]

default_access = {
    'views.company.Company': ['read'],
}
