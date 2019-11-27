import sys
from importlib import import_module
import logging
from apscheduler.executors.pool import ProcessPoolExecutor
from apscheduler.schedulers.background import BlockingScheduler

from core.utils import create_file_log_handler

# schedule is UTC time so assume +4 hours while daylight savings
cron_jobs = [
    #{'func': balances_cron, 'trigger': 'cron', 'day': '*', 'hour': 5}
]

if len(sys.argv) < 2:
    raise RuntimeWarning('Pass a job from the core.jobs package')

job = sys.argv[1]

if job == 'scheduler':
    # scheduled jobs
    sch_logger = logging.getLogger('apscheduler.scheduler')
    sch_logger.level = logging.INFO
    sch_logger.addHandler(create_file_log_handler('scheduler'))

    scheduler = BlockingScheduler(timezone='utc', executors={'default': ProcessPoolExecutor(20)})
    for job in cron_jobs:
        scheduler.add_job(**job)

    scheduler.start()

elif len(sys.argv) > 2:
    mod = import_module(job)
    meth = getattr(mod, sys.argv[2])
    meth()
else:
    import_module(job)
