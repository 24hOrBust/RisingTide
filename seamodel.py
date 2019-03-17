import urllib.parse
import urllib.request
import json


def sealevel(temperatures):
    """
  Returns change in sea level in meters.
  Temperatures is in absolute degrees celsius.
  """

    params = urllib.parse.urlencode({'t': temperatures}, doseq=True)
    url = "https://www.wolframcloud.com/objects/d3e0d08d-21ec-43e5-b4ef-cec98a094596" + "?" + params

    req = urllib.request.Request(url)
    r = urllib.request.urlopen(req).read()
    r_str = r.decode('utf-8')
    r_str = r_str.replace('{', '[').replace('}', ']')
    sealevels = json.loads(r_str)

    return sealevels


def get_sea_level(temp_deltas):
    # 8.5 was the average global surface temp in 2000 in degrees celsius
    temps = [t + 8.5 for t in temp_deltas]
    return sealevel(temps)
