"""
    Before test, you should run GAE local server, and clear datastore, text search,
     and update url in function 'setUp()'.
    --clear_datastore --clear_search_indexes

    unittest:
        $ cd Flask-GAE
        $ python tests
"""

import unittest, json, re, random
import requests


class TestFunctions(unittest.TestCase):
    def setUp(self):
        self.url = 'http://localhost:8081'
        self.email = 'kelp@phate.org'
        self.cookies = { 'dev_appserver_login': "kelp@phate.org:True:111325016121394242422" }


    def test_404_page(self):
        """
        test 404 page
        """
        r = requests.get('%s/aaa' % self.url, allow_redirects=False)
        self.assertEqual(r.status_code, 404)
        self.assertRegexpMatches(r.content, '<div class="status">404</div>')

    def test_405_page(self):
        """
        test 405 page
        """
        r = requests.post('%s/login' % self.url, allow_redirects=False)
        self.assertEqual(r.status_code, 405)
        self.assertRegexpMatches(r.content, '<div class="status">405</div>')

    def test_login_page(self):
        """
        test sign in page.
        """
        r = requests.get('%s/login' % self.url)
        self.assertEqual(r.status_code, 200)
        self.assertRegexpMatches(r.content, '.*<legend>Sign In</legend>.*')

    def test_00_home_page(self):
        """
        test home page
        """
        # get home page
        r = requests.get('%s/' % self.url, cookies=self.cookies)
        self.assertEqual(r.status_code, 200)

    def test_01_post(self):
        """
        create a post.
        :return:
        """
        # create a post
        r = requests.post('%s/posts' % self.url, cookies=self.cookies, data={'title': 'title-X', 'content': 'content-X'})
        self.assertEqual(r.status_code, 200)
        result = json.loads(r.content)
        self.assertTrue(result['success'])

        # get posts
        r = requests.get('%s/posts' % self.url, cookies=self.cookies)
        self.assertRegexpMatches(r.content, 'title-X')
        self.assertRegexpMatches(r.content, 'content-X')
        url = re.search('.*<a href="(.*)#" class="delete_post">.*', r.content).group(1)

        # delete the post
        r = requests.delete('%s%s' % (self.url, url), cookies=self.cookies)
        self.assertEqual(r.status_code, 200)
        result = json.loads(r.content)
        self.assertTrue(result['success'])



if __name__ == '__main__':
    unittest.main()