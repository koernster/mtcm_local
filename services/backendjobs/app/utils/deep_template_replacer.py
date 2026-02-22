import re

def deep_get(data, path):
    keys = path.split('.')
    for key in keys:
        if isinstance(data, list):
            # If key is an integer index
            try:
                key = int(key)
            except ValueError:
                key = 0  # default to first element
            data = data[key]
        else:
            data = data.get(key)
    return data

def replace_template_vars(template, data):
    def replacer(match):
        path = match.group(1)
        value = deep_get(data['data'], path)
        return str(value) if value is not None else ''
    return re.sub(r'@([^@]+)@', replacer, template)